'use strict';


var check_token = require('./tokenCheck').check_token;

var ERR = require('./consts/errConsts');

var mongoose = require('mongoose'),
    Post = mongoose.model('Posts'),
    Like = mongoose.model('Actions');

var hotness = require('./hotController').hotness;

var updateCB = function (res, post, person, hotness) {
    console.log("hotness :" + hotness);
    let query = {
        id: post.id
    };
    Post.findOneAndUpdate(query, {
        $inc: {number_of_likes: 1},
        $set: {hotness: hotness}
    }, {new: true}, function (err, post) {
        if (err) {
            console.log("Something wrong when updating posts!");
            res.send({
                pop_up_error: post.number_of_likes
            })
        } else {
            console.log(post);
            res.send({
                success: true
            });
        }
    });
};

var callbackForLike = function (res, post, person) {
    let userId = person.id;
    let postId = post.id;
    let query = {
        postId: post.id,
        userId: userId
    };
    Like.findOneAndUpdate(
        query,
        {$set: {like: 1}},
        {upsert: true, new: true},
        function (err, like) {
            if (err) {
                console.log("User " + userId + " liked post " + " " + postId + " UNSUCCESSFULLY");
                res.send({
                    pop_up_error: ERR.LIKE_ERROR
                })
            } else {
                console.log("User " + userId + " liked post " + " " + postId + " SUCCESSFULLY");
                post.number_of_likes = post.number_of_likes + 1;
                hotness(res, post, person, updateCB);
            }
        }
    );
};

var callbackToFindPost = function (res, postId, person) {
    let query = {
        id: postId
    };
    Post.findOne(query, function (err, post) {
        if (err || post === undefined || post === null) {
            res.send({
                pop_up_error: ERR.POST_NOT_FOUND_ERROR
            });
        }
        else {
            callbackForLike(res, post, person);
        }
    });
};
/**
 * This function handles like requests.
 * @param req
 * @param res
 */
exports.like_a_post = function (req, res) {
    console.log("A request to like a post has been received.");
    let postId = req.body.postId;
    var mainCallback = function (person) {
        if (person === undefined) {
            console.log(ERR.USER_ERROR);
            res.send({
                pop_up_error: ERR.USER_ERROR
            });
        } else {
            Like.findOne({
                'postId': postId,
                'userId': person.id,
                'like': 1
            }, function (err, like) {
                if (err) {
                    console.log("Error occurred while finding like query");
                    res.send(err);
                } else if (like === null) {
                    console.log("Liking the post...");
                    callbackToFindPost(res, postId, person);
                } else {
                    console.log("This user has already liked the post.");
                    res.send({
                        pop_up_error: ERR.ALREADY_LIKED_ERROR
                    })
                }
            })
        }
    };
    check_token(req, res, mainCallback);
};