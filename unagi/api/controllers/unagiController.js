'use strict';


//app constants:
const POST_PER_REQ = require('./consts/appConsts').POST_PER_REQ;

//geographic constants:
const radius = require('./consts/geoConsts').radius;

//Validators:
const lazyReqValidator = require("./validators/lazyReqVal").lazyReqValidator;

const ERR = require('./consts/errConsts');

//Other:
var mongoose = require('mongoose'),
    Post = mongoose.model('Posts'),
    Actions = mongoose.model('Actions');
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
            res.send({
                pop_up_error: ERR.USER_ERROR
            });
        } else {
            var afterValidationCB = function (req, res, person) {
                console.log(person);
                console.log("Someone has requested to see posts " + req.query.latitude + " " + req.query.longitude);
                let center = [req.query.latitude, req.query.longitude];
                let lastPost = req.query.lastpost;
                // var q = post.find({"loc":{"$geoWithin":{"$center":[center, radius]}}}.skip(0).limit(POST_PER_REQ))
                Post.find({
                    "timestamp": {
                        $lt: lastPost
                    },
                    "location": {
                        "$geoWithin": {
                            "$center": [center, radius]
                        }
                    }
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
                pop_up_error: ERR.USER_ERROR
            })
        }
    };
    check_token(req, res, callback);
};

//NOT-USED
exports.update_a_post = function (req, res) {
    var callback = function (person) {
        if (person !== undefined) {
            Post.findOneAndUpdate({
                _id: req.query.postId
            }, req.body, {
                new: true
            }, function (err, post) {
                if (err)
                    res.send(err);
                res.json(post);
            });
        } else {
            res.send({
                pop_up_error: ERR.USER_ERROR
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
        res.json({
            message: 'Post successfully deleted'
        });
    });
};

exports.list_hot_posts = require('./hotController').list_hot_posts;
var like_a_post = require('./like').like_a_post;
var unlike_a_post = require('./unlike').unlike_a_post;
exports.create_a_post = require('./createPost').create_a_post;

exports.activity = function (req, res) {
    console.log("Activity request received");
    if (req.body.action !== undefined) {
        if (req.body.postId !== undefined) {
            if (req.body.action === "like") {
                like_a_post(req, res);
            } else if (req.body.action === "unlike") {
                unlike_a_post(req, res);
            }
        } else {
            res.send({
                pop_up_error: ERR.ACTION_POST_ID_NOT_SENT_ERROR
            });
        }
    } else {
        res.send({
            pop_up_error: ERR.ACTION_NOT_SENT_ERROR
        });
    }
};