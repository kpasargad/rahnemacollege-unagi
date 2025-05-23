"use strict";

const ApiError = require('../../utils/ApiError'); // Required ApiError
var express = require("express"),
    app = express(),
    router = express.Router(),
    User = require("./../../models/unagiModel").users,
    Auth = require("./../../models/unagiModel").auths,
    config = require("./../../../config"),
    jwt = require("jsonwebtoken"),
    hash = require("../../utils/hash");

app.set("superSecret", config.secret);
var mongoose = require("mongoose"),
    Info = mongoose.model("Info");

/**
 * Handles user sign-in.
 * Finds the user by username, compares the password, and if successful,
 * prepares `req.user` for subsequent middleware.
 * @param {Object} req - The Express request object. `req.body` should contain `username` and `password`.
 * @param {Object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 */
exports.signin = function(req, res, next) {
    // Find the user by the provided username.
    User.findOne(
        {
            username: req.body.username
        },
        async function(dbErr, user) { 
            if (dbErr) {
                console.error("Error finding user:", dbErr);
                return next(dbErr); // Pass database errors to the global error handler.
            }

            // If no user is found with that username.
            if (!user) {
                return next(new ApiError(401, 'Authentication failed. User not found.'));
            }
            
            // User found, now compare the provided password with the stored hash.
            try {
                const match = await hash.comparePassword(req.body.password, user.password);
                if (match) {
                    // Passwords match. Prepare `req.user` for the next middleware.
                    req.user = {}; // Initialize req.user object.
                    req.user.user_id = user.id; // Store user's custom numeric ID.
                    req.user.imei = req.body.imei; // Store IMEI from request, used for client session tracking.
                    return next(); // Proceed to the next middleware (serializeClient).
                } else {
                    // Passwords don't match.
                    return next(new ApiError(401, 'Authentication failed. Wrong password.'));
                }
            } catch (compareError) {
                // Handle errors during password comparison (e.g., if hash is malformed).
                console.error("Error comparing password:", compareError);
                return next(compareError); 
            }
        }
    );
};

/**
 * Serializes the client session by finding or creating an Auth document.
 * Stores the client's ID (`client._id`) in `req.user.client_id`.
 * @param {Object} req - The Express request object. `req.user` is expected to have `user_id` and `imei`.
 * @param {Object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 */
exports.serializeClient = function(req, res, next) {
    // Find an Auth document for the given user_id and imei, or create it if it doesn't exist (upsert: true).
    // Update the lastLoginDate.
    Auth.findOneAndUpdate(
        { user_id: req.user.user_id, imei: req.user.imei },
        { lastLoginDate: Date.now() },
        { upsert: true, new: true }, // `new: true` returns the modified document.
        function(dbErr, client) { 
            if (dbErr) {
                console.error("Error in serializeClient:", dbErr);
                return next(dbErr);
            }
            // `upsert: true` should guarantee a client document is returned (either found or created).
            // However, defensive check for client existence.
            if (client) { 
              req.user.client_id = client._id; // Store the MongoDB _id of the Auth document.
            } else {
              // This case should ideally not be reached with upsert:true and new:true.
              console.error("Client is null after findOneAndUpdate with upsert:true in serializeClient. This is unexpected.");
              return next(new ApiError(500, "Failed to serialize client session."));
            }
            return next(); // Proceed to generateAccessToken.
        }
    );
};

/**
 * Generates an access token for the user.
 * The token payload includes `user_id`.
 * @param {Object} req - The Express request object. `req.user` (for sign-in) or `req.decoded` (for token refresh) should have `user_id`.
 * @param {Object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 */
exports.generateAccessToken = function(req, res, next) {
    // If req.user is not set (e.g., during token refresh flow), use req.decoded from authenticated refresh token.
    if (!req.user || req.user === undefined) { 
        req.user = {};
        req.user.user_id = req.decoded.user_id;
    }
    const payload = {
        user_id: req.user.user_id // Payload for the access token.
    };
    // Sign the token with the secret and set an expiration time.
    const accessToken = jwt.sign(payload, app.get("superSecret"), {
        expiresIn: 60 * 30 // Expires in 30 minutes.
    });
    console.log("Access token generated for user:", req.user.user_id);
    req.user.accessToken = accessToken; // Attach the access token to req.user.
    next(); // Proceed to generateRefreshToken or respond.
};

/**
 * Generates a refresh token for the user and client.
 * The token payload includes `user_id` and `client_id`.
 * @param {Object} req - The Express request object. `req.user` should have `user_id` and `client_id`.
 * @param {Object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 */
exports.generateRefreshToken = function(req, res, next) {
    const payload = {
        user_id: req.user.user_id, // User's custom ID.
        client_id: req.user.client_id // Auth document's MongoDB _id.
    };
    // Sign the refresh token with a longer expiration time.
    const refreshToken = jwt.sign(payload, app.get("superSecret"), {
        expiresIn: 60 * 60 * 24 * 30 // Expires in 30 days.
    });
    console.log("Refresh token generated for user:", req.user.user_id, "client:", req.user.client_id);
    req.user.refreshToken = refreshToken; // Attach the refresh token to req.user.
    next(); // Proceed to storeRefreshToken.
};

/**
 * Stores the generated refresh token in the Auth document associated with the client.
 * @param {Object} req - The Express request object. `req.user` should have `client_id` and `refreshToken`.
 * @param {Object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 */
exports.storeRefreshToken = function(req, res, next) {
    // Guard against missing user or client_id, though this should be set by prior middleware.
    if (!req.user || !req.user.client_id) { 
        console.error("Missing user or client_id in storeRefreshToken");
        return next(new ApiError(400, "Cannot store refresh token without client identifier."));
    }
    // Find the Auth document by its _id and update the refreshToken field.
    Auth.findOneAndUpdate(
        { _id: req.user.client_id },
        { refreshToken: req.user.refreshToken },
        function(dbErr, client) { 
            if (dbErr) {
                console.error("Error in storeRefreshToken:", dbErr);
                return next(dbErr);
            }
            // If no client document was found for the client_id, it's an error.
            if (!client) {
                console.warn("No client found to update in storeRefreshToken for client_id:", req.user.client_id);
                return next(new ApiError(404, "Client session not found to store refresh token."));
            }
            console.log("User's refresh token stored successfully for client_id:", client._id);
            return next(); // Proceed to respond.
        }
    );
};

/**
 * Sends the final response to the client with tokens and user/client IDs.
 * This is the terminal middleware in the sign-in chain.
 * @param {Object} req - The Express request object. `req.user` should contain all necessary token and ID info.
 * @param {Object} res - The Express response object.
 */
exports.respond = function(req, res) { // This function does not need 'next' as it's the end of the chain
    res
        .status(200)
        .json({
            success: true,
            message: "Enjoy your tokens!",
            user_id: req.user_id,
            client_id: req.user.client_id,
            refreshToken: req.user.refreshToken,
            accessToken: req.user.accessToken
        })
        .end();
};
