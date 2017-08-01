'use strict';

//error messages:
const USER_ERROR = "User error has occurred";
const LOC_NOT_FOUND_ERROR = "No location has been sent.";
const LOC_NOT_VALID_ERROR = "Location is sent but is not valid";
const TEXT_ERROR = "No text has been sent";
const NUMBER_OF_CHARACTERS_ERROR = "Illegal number of characters, more than 160 characters has been sent";
const UNLIKE_ERROR = "Unlike request has failed";
const LIKE_ERROR = "Like request has failed";
const ALREADY_LIKED_ERROR = "You have already liked this post";
const NOT_LIKED_UNLIKE_ERROR = "You have not liked this post but you had requested to unlike it";

//app constants:
const POST_PER_REQ = require('./consts/appConsts').POST_PER_REQ;
const CHARACTERS_BOUND = require('./consts/appConsts').CHARACTERS_BOUND;

//geographic constants:
const radius = require('./consts/geoConsts').radius;

//Validators:
const lazyReqValidator = require("./validators/lazyReqValidator").lazyReqValidator;

//Other:
var hotness = require('./hotController').h
var mongoose = require('mongoose'),
    Post = mongoose.model('Posts'),
    User = mongoose.model('Users'),
    Like = mongoose.model('Likes');
var send = require('./sendPost').send;

var check_token = require('./tokenCheck').check_token;
exports.check_token = check_token;


var list_all_posts = function (req, res) {
    Post.find({}, function (err, post) {
        if (err)
            res.send(err);
        res.json(post);
    });
};
exports.list_all_posts = list_all_posts;

var list_lazy = function (req, res) {
    var callback = (function (person) {
        if (person === undefined) {
            res.send(USER_ERROR);
        }
        else {
            var afterValidationCB = function (req, res, person) {
                console.log(person);
                console.log("Someone has requested to see posts " + req.query.latitude + " " + req.query.longitude);
                let center = [req.query.latitude, req.query.longitude];
                let lastPost = req.query.lastpost;
                // var q = post.find({"loc":{"$geoWithin":{"$center":[center, radius]}}}.skip(0).limit(POST_PER_REQ))
                Post.find({
                    "timestamp": {$lt: lastPost},
                    "location":
                        {"$geoWithin": {"$center": [center, radius]}}
                }, function (err, post) {
                    if (err) {
                        console.log("Request is invalid", lastPost);
                        res.send(err);
                    } else {
                        send(req, res, post, person);
                        try {
                            console.log("Lastpost : ", post[post.length - 1].timestamp);
                        } catch (error) {
                            console.log("There's no post to see.");
                        }
                    }
                }).limit(POST_PER_REQ);
            };
            lazyReqValidator(req, res, person, afterValidationCB);
        }
    });
    check_token(req, res, callback);
};
exports.list_lazy = list_lazy;


var create_a_post = function (req, res) {
    var callback = function (person) {
        if (person === undefined) {
            console.log(USER_ERROR);
            res.send({
                pop_up_error: USER_ERROR
            });
        }
        else {
            Post.findOne().sort({id: -1}).exec(function (err, post_with_highest_id) {
                if (err) {
                    res.send(err)
                }
                else if (req.body.Longitude === undefined || req.body.Latitude === undefined) {
                    console.log({
                        pop_up_error: LOC_NOT_FOUND_ERROR
                    });
                    res.send({
                        pop_up_error: LOC_NOT_FOUND_ERROR
                    });
                } else if (req.body.text === undefined) {
                    console.log(TEXT_ERROR);
                    res.send({
                        pop_up_error: TEXT_ERROR
                    });
                } else if (req.body.text.length > CHARACTERS_BOUND) {
                    console.log(NUMBER_OF_CHARACTERS_ERROR);
                    res.send({
                        pop_up_error: NUMBER_OF_CHARACTERS_ERROR
                    });
                } else {
                    var id = 1;
                    if (post_with_highest_id === null) {
                        //do nothing
                    } else {
                        id = post_with_highest_id.id + 1;
                    }
                    var new_post = new Post({
                        id: id,
                        text: req.body.text,
                        location: {
                            type: "Point",
                            coordinates:
                                [req.body.Latitude, req.body.Longitude]
                        },
                        author_id: person.id
                    });
                    console.log("new post:" + new_post);
                    new_post.save(function (err, post) {
                        if (err) {
                            console.log("error in saving the post.");
                            res.send(err);
                        }
                        else {
                            console.log("post is saved.");
                            res.json(post);
                        }
                    });
                }
            });
        }
    };
    check_token(req, res, callback);
};
exports.create_a_post = create_a_post;

exports.read_a_post = function (req, res) {
    var callback = function (person) {
        if (person !== undefined) {
            Post.findOne({
                id: req.params.postId
            }, function (err, post) {
                if (err) {
                    res.send(err);
                } else {
                    send(req, res, post, person);
                }
            });
        } else {
            res.send({
                pop_up_error: USER_ERROR
            })
        }
    };
    check_token(req, res, callback);
};

//NOT-USED
exports.update_a_post = function (req, res) {
    var callback = function (person) {
        if (person !== undefined) {
            Post.findOneAndUpdate({_id: req.query.postId}, req.body, {new: true}, function (err, post) {
                if (err)
                    res.send(err);
                res.json(post);
            });
        } else {
            res.send({
                pop_up_error: USER_ERROR
            })
        }
    };
    check_token(req, res, callback);
};

exports.delete_a_post = function (req, res) {
    Post.remove({
        _id: req.query.postId
    }, function (err, post) {
        if (err)
            res.send(err);
        res.json({message: 'Post successfully deleted'});
    });
};

/**
 * This function handles like requests.
 * @param req
 * @param res
 */
exports.like_a_post = function (req, res) {
    console.log("A request to like a post has been received.");
    var postId = req.params.postId;
    var callback = function (person) {
        if (person === undefined) {
            console.log(USER_ERROR);
            res.send({
                pop_up_error: USER_ERROR
            });
        } else {
            var userId = person.id;
            var new_Like = new Like({
                postId: postId,
                userId: person.id
            });
            var callbackForLike = function () {
                new_Like.save(function (err, like) {
                    if (err) {
                        console.log("User " + userId + " liked post " + " " + postId + " UNSUCCESSFULLY");
                        res.send({
                            pop_up_error: LIKE_ERROR
                        })
                    } else {
                        console.log("User " + userId + " liked post " + " " + postId + " SUCCESSFULLY");
                        Post.findOne({
                            id: postId
                        }, function (err, post) {
                            if (err) {
                                res.send({
                                    pop_up_error: LIKE_ERROR
                                })
                            } else {
                                post.number_of_likes++;
                                post.hotness = hotness(post);
                                res.send(like);
                            }
                        });
                    }
                });
            };
            Like.findOne({'postId': postId, 'userId': person.id}, function (err, like) {
                if (err) {
                    res.send(err);
                } else if (like === null) {
                    console.log("Liking the post...");
                    callbackForLike();
                } else {
                    console.log("This user has already liked the post.");
                    res.send({
                        pop_up_error: ALREADY_LIKED_ERROR
                    })
                }
            })
        }
    };
    check_token(req, res, callback);
};

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
            console.log(USER_ERROR);
            res.send({
                pop_up_error: USER_ERROR
            });
        } else {
            var removalCallBack = function () {
                Like.remove({
                    postId: postId,
                    userId: person.id
                }, function (err, like) {
                    if (err) {
                        res.send({
                            pop_up_error: UNLIKE_ERROR
                        });
                    } else {
                        Post.findOne({
                            id: postId
                        }, function (err, post) {
                            if (err) {
                                res.send({
                                    pop_up_error: UNLIKE_ERROR
                                })
                            } else {
                                post.number_of_likes--;
                                post.hotness = hotness(post);
                                res.send("removed like" + like);
                            }
                        });
                    }
                })
            };
            Like.findOne({
                postId: postId,
                userId: person.id
            }, function (err, like) {
                if (err) {
                    res.send({
                        pop_up_error: UNLIKE_ERROR
                    })
                } else {
                    if (like === null) {
                        res.send({
                            pop_up_error: NOT_LIKED_UNLIKE_ERROR
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

