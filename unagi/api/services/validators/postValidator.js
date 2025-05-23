'use strict';

const ApiError = require('../../utils/ApiError'); // Required ApiError
// Assuming consts are still in controllers/consts/ due to previous ls issues
const { CHARACTERS_BOUND } = require('../../../controllers/consts/appConsts'); 
const ERR = require('../../../controllers/consts/errConsts');
const Post = require('../../models/unagiModel').posts; // For parent_id lookup

const MONGO_OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

/**
 * Validates the request data for creating a new post.
 * Checks for text presence and length, valid latitude and longitude,
 * and validates parent_id if provided (format and existence).
 * 
 * @param {Object} req - The Express request object, containing post data in `req.body`.
 * @param {Object} res - The Express response object (currently not used to send responses directly from this function).
 * @param {function(Error|ApiError|null, Object=)} callback - The callback function to execute.
 *                                                            - If validation fails, called as `callback(error, null)`.
 *                                                            - If validation succeeds, called as `callback(null, parentPostOrUndefined)`.
 *                                                            `parentPostOrUndefined` is the parent Post document if `parent_id` was provided and valid, otherwise `undefined`.
 */
function validateCreatePost(req, res, callback) { // res is no longer used directly for sending errors
    const { text, Latitude, Longitude, parent_id } = req.body;

    // Text validation: Check for presence and ensure it's not just whitespace.
    if (!text || text.trim().length === 0) {
        return callback(new ApiError(400, ERR.TEXT_ERROR), null);
    }
    // Text validation: Check against maximum character limits.
    if (text.length > CHARACTERS_BOUND) {
        return callback(new ApiError(400, ERR.NUMBER_OF_CHARACTERS_ERROR), null);
    }

    // Latitude validation: Check for presence.
    if (Latitude === undefined || Latitude === null) {
        return callback(new ApiError(400, ERR.LATITUDE_REQUIRED || 'Latitude is required.'), null);
    }
    // Latitude validation: Check if it's a valid number and within the -90 to 90 range.
    const latNum = parseFloat(Latitude);
    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
        return callback(new ApiError(400, ERR.INVALID_LATITUDE || 'Invalid Latitude.'), null);
    }

    // Longitude validation: Check for presence.
    if (Longitude === undefined || Longitude === null) {
        return callback(new ApiError(400, ERR.LONGITUDE_REQUIRED || 'Longitude is required.'), null);
    }
    // Longitude validation: Check if it's a valid number and within the -180 to 180 range.
    const lonNum = parseFloat(Longitude);
    if (isNaN(lonNum) || lonNum < -180 || lonNum > 180) {
        return callback(new ApiError(400, ERR.INVALID_LONGITUDE || 'Invalid Longitude.'), null);
    }

    // Parent ID validation and lookup: Only if parent_id is provided.
    if (parent_id !== undefined && parent_id !== null && parent_id !== '') {
        // Validate parent_id format (must be a MongoDB ObjectId).
        if (!MONGO_OBJECT_ID_REGEX.test(parent_id)) {
            return callback(new ApiError(400, ERR.INVALID_PARENT_ID_FORMAT || 'Invalid parent_id format.'), null);
        }
        // Attempt to find the parent post in the database.
        Post.findById(parent_id, (dbErr, parentPost) => {
            if (dbErr) {
                console.error("Error finding parent post:", dbErr);
                // For unexpected DB errors, pass a generic server error.
                return callback(new ApiError(500, ERR.PARENT_POST_VALIDATION_ERROR || "Error validating parent post."), null);
            }
            // If parent post is not found, return a 404 error.
            if (!parentPost) {
                return callback(new ApiError(404, ERR.POST_PARENT_NOT_EXISTING_ERROR), null);
            }
            // Parent post found, proceed with the callback, passing the parentPost.
            return callback(null, parentPost); // Success: err is null, parentPost is found
        });
    } else {
        // No parent_id provided or it's empty, proceed without a parentPost.
        return callback(null, undefined); // Success: err is null, no parentPost
    }
}

module.exports = {
    validateCreatePost,
};
