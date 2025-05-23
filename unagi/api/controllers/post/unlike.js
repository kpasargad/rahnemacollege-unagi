'use strict';

const ApiError = require('../../utils/ApiError');
var fetch_user = require('./tokenCheck').fetch_user; // Assuming this is already updated for next

var ERR = require('../consts/errConsts'); // Corrected path

var mongoose = require('mongoose'),
    Post = mongoose.model('Posts'),
    Like = mongoose.model('Actions'); // This should be Actions model

var hotness = require('./hotController').hotness; // Assuming hotController is also refactored or handles errors

/**
 * Callback function to update the post's like count (decrement) and hotness score after an unlike.
 * @param {Object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 * @param {Object} post - The Post document that was unliked.
 * @param {Object} person - The user who unliked the post. (Currently unused in this specific function)
 * @param {number} hotnessValue - The new hotness value to set for the post.
 */
var updateCB = function (res, next, post, person, hotnessValue) { 
    console.log("hotness :" + hotnessValue);
    let query = {
        _id: post._id
    };
    // Atomically decrement the number_of_likes and set the new hotness value.
    Post.findOneAndUpdate(query, {
        $inc: {number_of_likes: -1}, 
        $set: {hotness: hotnessValue}
    }, {new: true}, function (dbErr, updatedPost) {
        if (dbErr) {
            console.error("Something wrong when updating post likes/hotness for unlike:", dbErr);
            return next(dbErr);
        }
        console.log(updatedPost); // Log the updated post.
        res.json({ // Send success response.
            success: true
        });
    });
};

/**
 * Updates an Action document to record a user's unlike on a post.
 * Sets `like: false` for the action.
 * @param {Object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 * @param {Object} post - The Post document to be unliked.
 * @param {Object} person - The user performing the unlike action.
 */
var callbackForUnlike = function (res, next, post, person) { 
    let query = {
        post_id: post._id, // Query by actual MongoDB _id of the post
        user_id: person._id // Query by actual MongoDB _id of the user
    };
    // Find the existing 'like' action and set its 'like' field to false.
    // Note: Unlike like.js, upsert:true is not used here, assuming an unlike must follow a like.
    // If the action document might not exist, {new: true} alone won't create it.
    // However, the current logic in `notLiked` ensures this is only called if a like action exists.
    Like.findOneAndUpdate(
        query,
        {$set: {like: false}}, // Set like: false for an unlike action
        {new: true}, 
        function (dbErr, likeAction) { // likeAction is the updated Action document
            if (dbErr) {
                console.error("User " + person.id + " unliked post " + post.id + " UNSUCCESSFULLY (DB Error)", dbErr);
                return next(dbErr);
            }
            console.log("User " + person.id + " unliked post " + post.id + " SUCCESSFULLY");
            // Decrement local post object's like count for hotness calculation.
            // Ensure likes don't go below zero.
            post.number_of_likes = Math.max(0, post.number_of_likes - 1); 
            hotness(res, next, post, person, updateCB); // Proceed to update hotness score.
        }
    );
};

/**
 * Checks if the user had previously liked the post before allowing an unlike.
 * If a like exists, proceeds to `callbackForUnlike`. Otherwise, returns an error.
 * @param {Object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 * @param {Object} post - The Post document to be unliked.
 * @param {Object} person - The user performing the unlike action.
 */
var notLiked = function (res, next, post, person) { 
    // Check for an existing 'like' action (like: true) by this user for this post.
    Like.findOne({
        user_id: person._id, 
        post_id: post._id,
        like: true 
    }, function (dbErr, like) { // 'like' here is the existing "like" Action document
        if (dbErr) {
            console.error("Error checking like status for unlike:", dbErr);
            return next(dbErr);
        }
        if (like !== null) { // A "like" action exists, so proceed to unlike.
            callbackForUnlike(res, next, post, person); 
        } else { // No "like" action found, so user cannot unlike.
            console.log(ERR.NOT_LIKED_UNLIKE_ERROR);
            return next(new ApiError(400, ERR.NOT_LIKED_UNLIKE_ERROR));
        }
    })
};

/**
 * Fetches the post to be unliked from the database using its custom ID.
 * Then proceeds to check if the user can perform an unlike action.
 * @param {Object} req - The Express request object, containing `postId` in `req.body`.
 * @param {Object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 * @param {Object} person - The authenticated user object from `fetch_user`.
 */
var fetch_post = function (req, res, next, person) { 
    // Redundant check if fetch_user handles its errors properly.
    if (person === undefined) {
        console.log(ERR.USER_ERROR + " (in fetch_post, should have been caught by fetch_user)");
        return next(new ApiError(401, ERR.USER_ERROR));
    }

    let postId = req.body.postId; // PostId format is validated in activity.js
    // Find the post by its custom numeric 'id' field.
    Post.findOne({
        id: postId, 
    }, function (dbErr, post) {
        if (dbErr) {
            console.error("Error finding post in fetch_post (unlike):", dbErr);
            return next(dbErr);
        }
        if (post === null || post === undefined) { // If post is not found.
            console.log(ERR.POST_NOT_FOUND_ERROR + " for postId: " + postId);
            return next(new ApiError(404, ERR.POST_NOT_FOUND_ERROR));
        }
        // Post found, proceed to check if it was previously liked by this user.
        notLiked(res, next, post, person); 
    })
};

/**
 * Main route handler for unliking a post.
 * First fetches the user, then the post, then processes the unlike action.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 */
exports.unlike_a_post = function (req, res, next) { 
    console.log("A request to unlike a post has been received.");
    // `fetch_user` is expected to call `fetch_post` with (req, res, next, person)
    // or call `next(err)` if user authentication fails.
    fetch_user(req, res, next, fetch_post);
};