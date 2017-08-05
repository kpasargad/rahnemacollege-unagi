'use strict';


var check_token = require('./tokenCheck').check_token;

var ERR = require('./consts/errConsts');

var mongoose = require('mongoose'),
    Post = mongoose.model('Posts'),
    Like = mongoose.model('Likes'),
    Actions = mongoose.model('Actions');

var hotness = require('./hotController').hotness;


/**
 * This function handles the unlike request.
 * @param req
 * @param res
 */
exports.unlike_a_post = function (req, res) {
    console.log("A request to unlike a post has been received.");
    var postId = req.params.postId;
    var callback = function (person) {
        if (person === undefined) {
            console.log(ERR.USER_ERROR);
            res.send({
                pop_up_error: ERR.USER_ERROR
            });
        } else {
            var removalCallBack = function () {
                Like.remove({
                    postId: postId,
                    userId: person.id
                }, function (err, like) {
                    if (err) {
                        res.send({
                            pop_up_error: ERR.UNLIKE_ERROR
                        });
                    } else {
                        var query = {
                            id: postId
                        };
                        Post.findOne(query, function (err, post) {
                            if (err) {
                                res.send(ERR.POST_NOT_FOUND_ERROR);
                            }
                            else {
                                let actionsCB = function () {
                                    let actionQuery = {
                                        userId: person.id,
                                        postId: postId
                                    };
                                    Actions.findOneAndUpdate(
                                        actionQuery,
                                        {$set: {like: 0}},
                                        {upsert: true},
                                        function (err, action) {
                                            if (err) {
                                                console.log("Something went wrong while upserting an action(unliking).")
                                            } else {
                                                console.log(action);
                                            }
                                        });
                                };

                                post.number_of_likes = post.number_of_likes - 1;
                                var updateCB = function (hotness) {
                                    console.log("hotness :" + hotness);
                                    Post.findOneAndUpdate(query, {
                                        $inc: {number_of_likes: -1},
                                        $set: {hotness: hotness}
                                    }, {new: true}, function (err, post) {
                                        if (err) {
                                            console.log("Something wrong when updating posts!");
                                            res.send({
                                                pop_up_error: post.number_of_likes
                                            })
                                        } else {
                                            console.log(post);
                                            actionsCB();
                                            res.send();
                                        }
                                    });
                                };
                                hotness(post, updateCB);
                            }
                        })
                    }
                })
            };
            Like.findOne({
                postId: postId,
                userId: person.id
            }, function (err, like) {
                if (err) {
                    res.send({
                        pop_up_error: ERR.UNLIKE_ERROR
                    })
                } else {
                    if (like === null) {
                        res.send({
                            pop_up_error: ERR.NOT_LIKED_UNLIKE_ERROR
                        })
                    } else {
                        removalCallBack();
                    }
                }
            })
        }
    };
    check_token(req, res, callback);
};
