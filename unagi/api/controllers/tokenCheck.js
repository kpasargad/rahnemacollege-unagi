"use strict";

var mongoose = require("mongoose"),
    UserModel = mongoose.model("Users");

var ERR = require("./consts/errConsts");
const ApiError = require('../utils/ApiError'); // Added ApiError

/**
 * This function finds the user who is requesting in the database and passes it to other fuunctions
 * @param req
 * @param res
 * @param next
 * @param callback
 */
var fetch_user = function(req, res, next, callback) { // Added next
    console.log("fetching user");
    var decoded = req.decoded; // Assuming req.decoded is set by a previous middleware (e.g., authModule.authenticateAccessToken)
    if (!decoded || !decoded.user_id) {
        // This case should ideally be caught by the auth middleware itself,
        // but as a safeguard here:
        return next(new ApiError(401, ERR.INVALID_TOKEN_ERROR || "Invalid token or user_id missing from token."));
    }

    UserModel.findOne({ id: decoded.user_id }, function(dbErr, person) {
        if (dbErr) {
            console.error("Error finding user in tokenCheck:", dbErr);
            return next(new ApiError(500, ERR.USER_ERROR || "Database error while fetching user."));
        }
        if (person === null) {
            console.log("USER NOT FOUND IN FETCH USER - token user_id:", decoded.user_id);
            // Using a more specific error for user not found based on token
            return next(new ApiError(404, ERR.USER_NOT_FOUND_FROM_TOKEN || "User identified by token not found.")); 
        }
        // User found
        console.log("found person " + person.username); // Log username or another non-sensitive identifier
        callback(req, res, next, person); // Passed next to callback
    });
};
module.exports.fetch_user = fetch_user;
