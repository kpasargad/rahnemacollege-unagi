var fetch_user = require("./tokenCheck").fetch_user;

var ERR = require("./consts/errConsts");

var mongoose = require("mongoose"),
    Post = mongoose.model("Posts"),
    Actions = mongoose.model("Actions"),
    Info = mongoose.model("Info");

var hotnessBaseValue = require("./hotController").hotnessBaseValue;

const { validateCreatePost } = require('../../services/validators/postValidator'); // Added validator

/**
 * Adds a new post to the database.
 * Also updates the parent post's children_id array if a parent_id is provided.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {number} id - The unique ID for the new post (obtained from Info schema counter).
 * @param {Object} person - The authenticated user object (author of the post).
 * @param {Object} [parent] - The parent Post document, if this is a reply. Undefined otherwise.
 */
var add_post_to_database = function(req, res, id, person, parent) {
    // Determine parent_id for the new post based on the parent document.
    // Note: The variable `parent_id` was previously declared in a higher scope (postCreationCallBack). 
    // For clarity, it would be better to pass parent._id directly or set it explicitly here.
    // Assuming `parent_id` from the outer scope is intended if `parent` is not undefined.
    // If parent is undefined, then this post has no parent, so `parent_id` should be undefined.
    const currentParentId = parent ? parent._id : undefined;

    var new_post = new Post({
        id: id, // Unique ID for the post
        text: req.body.text,
        location: { // GeoJSON structure for location
            type: "Point",
            coordinates: [req.body.Latitude, req.body.Longitude]
        },
        author_id: person.id, // ID of the user creating the post
        timestamp: Date.now(),
        hotness: hotnessBaseValue(Date.now()), // Calculate initial hotness score
        parent_id: currentParentId // Link to parent post if it's a reply
    });
    console.log("new post:" + new_post);
    new_post.save(function(err, post) {
        if (err) {
            console.error("Error saving post:", err); // Log error
            // Send generic error response
            if (!res.headersSent) {
                return res.status(500).json({ success: false, message: "An error occurred while creating the post." });
            }
            return;
        }
        // post is saved
        if (parent !== undefined) {
            Post.findOneAndUpdate(
                { _id: parent._id },
                { $push: { children_id: post._id } },
                { new: true },
                function(err, updated_parent) {
                    if (err) {
                        console.error("Error updating parent post:", err); // Log error
                        // Send generic error response
                        if (!res.headersSent) {
                            return res.status(500).json({ success: false, message: "An error occurred while updating the parent post." });
                        }
                        return;
                    }
                    // Parent updated
                    if (!res.headersSent) {
                        console.log(updated_parent);
                        res.send({
                                success: true
                            });
                        }
                    }
                );
            } else {
                res.send({
                    success: true
                });
            }
        }
    });
};

/**
 * This function fetches the id of the post
 * @param req
 * @param {Object} res - The Express response object.
 * @param {Object} person - The authenticated user object.
 * @param {Object} [parent] - The parent Post document, if validated and found. Undefined otherwise.
 */
var postCreationCallBack = function(req, res, person, parent) {
    // Log details for debugging.
    console.log("post creation person :" + person.username); // Log username for privacy
    console.log("post creation parent :" + (parent ? parent.id : 'undefined'));

    // Note: The global variable `parent_id` is being set here. This is not ideal practice.
    // It's better to pass `parent._id` directly to `add_post_to_database` or handle it within that function.
    // This was done to maintain existing logic where `add_post_to_database` expects `parent_id` from its outer scope.
    parent_id = parent ? parent._id : undefined; 
    console.log("parent id for new post: " + parent_id);

    // Fetch the Info document to get the next available ID for the post.
    Info.findOne({}, function(err, info) {
        if (err) {
            console.error("Error finding info (in postCreationCallBack):", err); // Log error
            if (!res.headersSent) {
                return res.status(500).json({ success: false, message: "An error occurred during post creation process." });
            }
            return;
        }
        if (info === null) { // Changed else if to if for clarity, original logic maintained
            Info.findOneAndUpdate(
                {},
                {
                    $set: {
                        post_id_counter: 2000, // Changed from number_of_actions_requests
                        number_of_user_requests: 2000, // Keep as is, for user IDs
                        action_document_id_counter: 2000, // Initialize new counter
                        // counter_for_actions_collection might also need initialization if used
                        // For now, focusing on post_id_counter and action_document_id_counter
                    }
                },
                { upsert: true, new: true },
                function(err, newInfo) { // Renamed info to newInfo to avoid confusion
                    if (err) {
                        console.error("Error creating info (in postCreationCallBack):", err); // Log error
                        if (!res.headersSent) {
                           return res.status(500).json({ success: false, message: "An error occurred during post creation process." });
                        }
                        return;
                    }
                    let id = newInfo.post_id_counter; // Changed from number_of_actions_requests
                    add_post_to_database(req, res, id, person, parent);
                }
            );
        } else {
            Info.findOneAndUpdate(
                {},
                { $inc: { post_id_counter: 1 } }, // Changed from number_of_actions_requests
                { upsert: true, new: true },
                function(err, updatedInfo) { // Renamed info to updatedInfo
                    if (err) {
                        console.error("Error updating info (in postCreationCallBack):", err); // Log error
                        if (!res.headersSent) {
                            return res.status(500).json({ success: false, message: "An error occurred during post creation process." });
                        }
                        return;
                    }
                    let id = updatedInfo.post_id_counter; // Changed from number_of_actions_requests
                    add_post_to_database(req, res, id, person, parent);
                }
            );
        }
    });
};

/**
 * This is the main function to handle post creation requests and checks whether the user exists or not
 * @param req
 * @param {Object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 * @param {Object} person - The authenticated user object, passed from `fetch_user`.
 */
var mainCallBack = function(req, res, next, person) { // Added next
    // This callback is executed after `fetch_user` identifies the user.
    if (person === undefined) {
        // This case should ideally be handled by `fetch_user` by calling `next` with an error.
        // If it reaches here, it implies an issue with token validation or user fetching.
        console.log(ERR.USER_ERROR + " (in mainCallBack, should have been caught by fetch_user)");
        return next(new ApiError(401, ERR.USER_ERROR)); 
    }
    
    // User is identified, proceed with post data validation.
    // `validateCreatePost` will check `req.body` and call its callback.
    validateCreatePost(req, res, (validationErr, parentPost) => { // res is passed but not used by validator to send response
        if (validationErr) {
            return next(validationErr); // Pass validation error (ApiError instance) to global error handler.
        }
        // Validation successful, proceed to the next step in post creation.
        // `parentPost` will be the parent document if `parent_id` was valid, or undefined.
        postCreationCallBack(req, res, person, parentPost);
    });
};

/**
 * Main route handler for creating a post.
 * It first fetches the user based on the token, then proceeds with validation and post creation.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 */
var create_a_post = function(req, res, next) { // Added next
    // `fetch_user` (from tokenCheck.js) is expected to identify the user making the request.
    // It should call `mainCallBack` with `(req, res, next, person)` or call `next(err)` if user fetch fails.
    fetch_user(req, res, next, mainCallBack); 
};

exports.create_a_post = create_a_post;
