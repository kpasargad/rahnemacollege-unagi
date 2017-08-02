'use strict';

var checkToken = require('./tokenCheck').check_token;
var hotness = require('./hotController').hotness;

var mongoose = require('mongoose'),
    Post = mongoose.model('Posts');

var hotness = function (post, callback) {
    //TODO: handle errors of unavailable posts.
    var likes = post.number_of_likes;
    console.log("NUMBER OF LIKES = ",likes);
    var date = post.timestamp;
    var order = Math.log10(Math.max(likes, 1), 10);
    var seconds = date - 1134028003;
    callback(Math.round(order + seconds / 45000, 7));
};
exports.hotness = hotness;

var hotnessBaseValue = function(date){
    var likes = 0;
    console.log("NUMBER OF LIKES = ",likes);
    var date = date
    var order = Math.log10(Math.max(likes, 1), 10);
    var seconds = date - 1134028003;
    return Math.round(order + seconds / 45000, 7);
};
exports.hotnessBaseValue = hotnessBaseValue;


exports.list_hot_posts = function (req, res) {
    var callback = function (person) {
        Post.find()
            .sort({
                hotness: 1
            })
            .limit(10)
            .exec(err, function (err, post) {
                if (err) {
                    res.send(err);
                } else {
                    //TODO
                }
            });
    };
    checkToken(req, res, callback);
};