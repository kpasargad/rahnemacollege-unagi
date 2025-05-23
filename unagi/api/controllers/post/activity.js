'use strict';

const ApiError = require('../../utils/ApiError'); // Required ApiError
const ERR = require('../../consts/errConsts');
var like_a_post = require('./like').like_a_post;
var unlike_a_post = require('./unlike').unlike_a_post;

/**
 * Handles incoming post activity requests, specifically 'like' and 'unlike' actions.
 * It validates the request parameters and delegates to the appropriate controller function.
 * @param {Object} req - The Express request object. Expected to have `action` and `postId` in `req.body`.
 * @param {Object} res - The Express response object.
 * @param {function} next - The Express next middleware function for error handling.
 */
exports.activity = function (req, res, next) { // Added next
    console.log("Activity request received");

    // Validate that an 'action' is specified in the request body.
    if (req.body.action === undefined) {
        return next(new ApiError(400, ERR.ACTION_NOT_SENT_ERROR));
    }

    // Validate that a 'postId' is specified in the request body.
    if (req.body.postId === undefined) {
        return next(new ApiError(400, ERR.ACTION_POST_ID_NOT_SENT_ERROR));
    }

    // Validate the format of the 'postId' (must be a MongoDB ObjectId).
    const MONGO_OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;
    if (!MONGO_OBJECT_ID_REGEX.test(req.body.postId)) {
        return next(new ApiError(400, ERR.INVALID_POST_ID_FORMAT));
    }

    // Delegate to the appropriate function based on the 'action' value.
    if (req.body.action === "like") {
        like_a_post(req, res, next); // Pass control to like_a_post
    } else if (req.body.action === "unlike") {
        unlike_a_post(req, res, next); // Pass control to unlike_a_post
    } else {
        // If the action is not 'like' or 'unlike', it's considered invalid.
        return next(new ApiError(400, ERR.ACTION_INVALID_ERROR));
    }
};
