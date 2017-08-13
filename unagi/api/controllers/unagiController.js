'use strict';

const ERR = require('./consts/errConsts');

//Other:
var mongoose = require('mongoose'),
    Post = mongoose.model('Posts'),
    Actions = mongoose.model('Actions');

var fetch_user = require('./tokenCheck').fetch_user;
exports.fetch_user = fetch_user;


var list_all_posts = function (req, res) {
    Post.find({}, function (err, post) {
        if (err)
            res.send(err);
        res.json(post);
    });
};
exports.list_all_posts = list_all_posts;


exports.list_lazy = require('./unagiLazyList').list_lazy;


exports.list_hot_posts = require('./hotController').list_hot_posts;
exports.create_a_post = require('./createPost').create_a_post;
exports.read_a_post = require('./singleRead').read_a_post;
exports.my_posts = require('./myPosts').my_posts;
var like_a_post = require('./like').like_a_post;
var unlike_a_post = require('./unlike').unlike_a_post;

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