'use strict';


var fetch_user = require('./tokenCheck').fetch_user;

var ERR = require('./consts/errConsts');

var mongoose = require('mongoose'),
    Post = mongoose.model('Posts'),
    Like = mongoose.model('Actions'),
    Info = mongoose.model('Info');

var hotness = require('./hotController').hotness;

var updateCB = function (res, post, person, hotness) {
    console.log("hotness :" + hotness);
    let query = {
        _id: post._id
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

function add_like_to_database(res, post, id, person) {
    let query = {
        post_id: post._id,
        user_id: person._id
    };
    let time = Date.now();
    Like.findOneAndUpdate(
        query,
        {$set: {like: 1, timestamp: time, id: id}},
        {upsert: true, new: true},
        function (err, like) {
            if (err) {
                console.log("User " + person.id + " liked post " + " " + post.id + " UNSUCCESSFULLY");
                res.send({
                    pop_up_error: ERR.LIKE_ERROR
                })
            } else {
                console.log("User " + person.id + " liked post " + " " + post.id + " SUCCESSFULLY");
                post.number_of_likes = post.number_of_likes + 1;
                hotness(res, post, person, updateCB);
            }
        }
    );

}

var callbackForLike = function (res, post, person) {
    Info.findOne({},
        function (err, info) {
            if (err) {
                res.send(err);
            } else if (info === null) {
                Info.findOneAndUpdate({},
                    {
                        $set: {
                            number_of_actions_requests: 2000,
                            number_of_user_requests: 2000,
                            number_of_post_requests: 2000
                        }
                    },
                    {upsert: true, new: true},
                    function (err, info) {
                        if (err) {
                            res.send(err);
                        } else {
                            let id = info.number_of_actions_requests;
                            add_like_to_database(res, post, id, person);
                        }
                    }
                );
            } else {
                Info.findOneAndUpdate({},
                    {$inc: {number_of_actions_requests: 1}},
                    {upsert: true, new: true},
                    function (err, info) {
                        if (err) {
                            res.send(err);
                        } else {
                            let id = info.number_of_actions_requests;
                            add_like_to_database(res, post, id, person);
                        }
                    }
                );
            }
        });
};

var likeAlreadyExists = function (res, post, person) {
    Like.findOne({
        user_id: person._id,
        post_id: post._id,
        like: 1
    }, function (err, like) {
        if (err) {
            console.log(ERR.LIKE_ERROR);
            res.send({
                pop_up_error: ERR.LIKE_ERROR
            })
        } else if (like !== null) {
            console.log(ERR.ALREADY_LIKED_ERROR);
            res.send({
                pop_up_error: ERR.ALREADY_LIKED_ERROR
            })
        } else {
            callbackForLike(res, post, person);
        }
    })
};


/**
 * This function handles like requests.
 * @param req
 * @param res
 * @param person
 */
var fetch_post = function (req, res, person) {
    if (person === undefined) {
        console.log(ERR.USER_ERROR);
        res.send({
            pop_up_error: ERR.USER_ERROR
        });
    } else {
        let postId = req.body.postId;
        Post.findOne({
            id: postId,
        }, function (err, post) {
            if (err) {
                console.log(ERR.POST_NOT_FOUND_ERROR);
                res.send({
                    pop_up_error: ERR.POST_NOT_FOUND_ERROR
                })
            } else if (post === null || post === undefined) {
                console.log(ERR.POST_NOT_FOUND_ERROR);
                res.send({
                    pop_up_error: ERR.POST_NOT_FOUND_ERROR
                })
            } else {
                likeAlreadyExists(res, post, person)
            }
        })
    }
};

exports.like_a_post = function (req, res) {
    console.log("A request to like a post has been received.");
    fetch_user(req, res, fetch_post);
};