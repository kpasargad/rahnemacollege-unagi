'use strict';

var checkToken = require('./tokenCheck').check_token;
var send = require('./sendPost').send;

var mongoose = require('mongoose'),
    Post = mongoose.model('Posts');

var hotness = function (res, post, person, callback) {
    //TODO: handle errors of unavailable posts.
    var likes = post.number_of_likes;
    console.log("NUMBER OF LIKES = ", likes);
    var date = post.timestamp / 1000;
    var order = Math.log10(Math.max(likes, 1), 10);
    var seconds = date - 1134028003;
    callback(res, post, person, Math.round((order + seconds / 45000) * 10000000) / 10000000);
};
exports.hotness = hotness;

var hotnessBaseValue = function (date) {
    var likes = 0;
    console.log("NUMBER OF LIKES = ", likes);
    var date = date / 1000;
    var order = Math.log10(Math.max(likes, 1), 10);
    var seconds = date - 1134028003;
    return Math.round((order + seconds / 45000) * 10000000) / 10000000;
};
exports.hotnessBaseValue = hotnessBaseValue;


exports.list_hot_posts = function (req, res) {
    var callback = function (person) {
        Post.find()
            .sort({
                hotness: -1
            })
            .limit(10)
            .exec(function (err, post) {
                console.log('BULLSHIT');
                if (err) {
                    res.send(err);
                } else {
                    send(req, res, post, person);
                }
            });
    };
    checkToken(req, res, callback);
};