'use strict';

const ApiError = require('../../utils/ApiError'); // Added ApiError
var fetch_user = require('./tokenCheck').fetch_user; // Assuming this is already updated for next

var ERR = require('../consts/errConsts'); // Corrected path

var mongoose = require('mongoose'),
    Post = mongoose.model('Posts'),
    Like = mongoose.model('Actions'), // This should be Actions model
    Info = mongoose.model('Info');

var hotness = require('./hotController').hotness; // Assuming hotController is also refactored or handles errors

/**
 * Callback function to update the post's like count and hotness score.
 * This is called after a like action is successfully recorded.
 * @param {Object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 * @param {Object} post - The Post document that was liked.
 * @param {Object} person - The user who liked the post. (Currently unused in this specific function but part of the chain)
 * @param {number} hotnessValue - The new hotness value to set for the post.
 */
var updateCB = function (res, next, post, person, hotnessValue) { // Added next, changed hotness to hotnessValue
    console.log("hotness :" + hotnessValue);
    let query = {
        _id: post._id
    };
    // Atomically increment the number_of_likes and set the new hotness value.
    Post.findOneAndUpdate(query, {
        $inc: {number_of_likes: 1},
        $set: {hotness: hotnessValue}
    }, {new: true}, function (dbErr, updatedPost) {
        if (dbErr) {
            console.error("Something wrong when updating post likes/hotness:", dbErr);
            return next(dbErr); // Pass DB error to global handler
        }
        console.log(updatedPost); // Log the updated post document.
        res.json({ // Send success response.
            success: true
        });
    });
};

/**
 * Creates or updates an Action document to record a user's like on a post.
 * Sets `like: true` for the action.
 * @param {Object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 * @param {Object} post - The Post document to be liked.
 * @param {number} id - The unique ID for the new Action document (from Info schema counter).
 * @param {Object} person - The user performing the like action.
 */
function add_like_to_database(res, next, post, id, person) { // Added next
    let query = {
        post_id: post._id, // Query by the actual MongoDB _id of the post
        user_id: person._id // Query by the actual MongoDB _id of the user
    };
    let time = Date.now();
    // Find an existing action or create a new one (upsert: true).
    // Set the 'like' field to true, update timestamp, and set the action's unique ID.
    Like.findOneAndUpdate(
        query,
        {$set: {like: true, timestamp: time, id: id}}, // Set like: true
        {upsert: true, new: true},
        function (dbErr, like) { // 'like' here is the Action document
            if (dbErr) {
                console.error("User " + person.id + " liked post " + post.id + " UNSUCCESSFULLY (DB Error)", dbErr);
                return next(dbErr); // Pass DB error to global handler
            }
            console.log("User " + person.id + " liked post " + post.id + " SUCCESSFULLY");
            // Increment local post object's like count for hotness calculation.
            // Note: This modification is local to this post object and is not saved directly here.
            // The actual number_of_likes is incremented atomically in updateCB.
            post.number_of_likes = post.number_of_likes + 1; 
            hotness(res, next, post, person, updateCB); // Proceed to update hotness score. Passed next.
        }
    );
}

/**
 * Fetches the next available ID for an Action document from the Info collection.
 * Then calls `add_like_to_database` to record the like.
 * @param {Object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 * @param {Object} post - The Post document to be liked.
 * @param {Object} person - The user performing the like action.
 */
var callbackForLike = function (res, next, post, person) { // Added next
    // Fetches the global Info document which contains counters.
    Info.findOne({},
        function (dbErr, info) {
            if (dbErr) {
                console.error("Error finding Info in callbackForLike:", dbErr);
                return next(dbErr);
            }
            if (info === null) { // If Info document doesn't exist, create it with initial counter values.
                Info.findOneAndUpdate({},
                    {
                        $set: { 
                            post_id_counter: 2000, 
                            number_of_user_requests: 2000, // For User.id
                            action_document_id_counter: 2000 // For Actions.id
                        }
                    },
                    {upsert: true, new: true},
                    function (infoDbErr, newInfo) {
                        if (infoDbErr) {
                            console.error("Error creating Info in callbackForLike:", infoDbErr);
                            return next(infoDbErr);
                        }
                        // Use the new action_document_id_counter.
                        let id = newInfo.action_document_id_counter; 
                        add_like_to_database(res, next, post, id, person); // Passed next
                    }
                );
            } else { // Info document exists, increment the action_document_id_counter.
                Info.findOneAndUpdate({},
                    {$inc: {action_document_id_counter: 1}}, 
                    {upsert: true, new: true},
                    function (infoDbErr, updatedInfo) {
                        if (infoDbErr) {
                            console.error("Error updating Info in callbackForLike:", infoDbErr);
                            return next(infoDbErr);
                        }
                        // Use the incremented action_document_id_counter.
                        let id = updatedInfo.action_document_id_counter; 
                        add_like_to_database(res, next, post, id, person); // Passed next
                    }
                );
            }
        });
};

/**
 * Checks if the user has already liked the post.
 * If not, proceeds to `callbackForLike` to record the like.
 * @param {Object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 * @param {Object} post - The Post document to be liked.
 * @param {Object} person - The user performing the like action.
 */
var likeAlreadyExists = function (res, next, post, person) { // Added next
    // Check for an existing 'like' action by this user for this post.
    Like.findOne({
        user_id: person._id, 
        post_id: post._id,
        like: true // Check if the 'like' field is true.
    }, function (dbErr, like) { // 'like' here is the Action document
        if (dbErr) {
            console.error("Error checking if like exists:", dbErr);
            return next(dbErr);
        }
        if (like !== null) { // If a 'like' action already exists.
            console.log(ERR.ALREADY_LIKED_ERROR);
            return next(new ApiError(409, ERR.ALREADY_LIKED_ERROR)); // 409 Conflict status for already liked.
        }
        // No existing like, proceed to record the new like.
        callbackForLike(res, next, post, person); // Passed next
    })
};

/**
 * Fetches the post to be liked from the database using its custom ID.
 * Then proceeds to check if the user has already liked it.
 * @param {Object} req - The Express request object, containing `postId` in `req.body`.
 * @param {Object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 * @param {Object} person - The authenticated user object from `fetch_user`.
 */
var fetch_post = function (req, res, next, person) { // Added next
    // This check is somewhat redundant if fetch_user correctly calls next(err) on failure.
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
            console.error("Error finding post in fetch_post:", dbErr);
            return next(dbErr);
        }
        if (post === null || post === undefined) { // If post is not found.
            console.log(ERR.POST_NOT_FOUND_ERROR + " for postId: " + postId);
            return next(new ApiError(404, ERR.POST_NOT_FOUND_ERROR));
        }
        // Post found, proceed to check if it's already liked.
        likeAlreadyExists(res, next, post, person); // Passed next
    })
};

/**
 * Main route handler for liking a post.
 * First fetches the user, then the post, then processes the like action.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 */
exports.like_a_post = function (req, res, next) { // Added next
    console.log("A request to like a post has been received.");
    // `fetch_user` is expected to call `fetch_post` with (req, res, next, person)
    // or call `next(err)` if user authentication fails.
    fetch_user(req, res, next, fetch_post); 
};