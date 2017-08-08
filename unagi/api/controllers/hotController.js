'use strict';

var fetch_user = require('./tokenCheck').fetch_user;
var send = require('./sendPost').send;

var mongoose = require('mongoose'),
    Post = mongoose.model('Posts');

var ERR = require('./consts/errConsts');

//geographic constants:
const radius = require('./consts/geoConsts').radius;

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

var show_hot_posts = function (req, res, person) {
    let latitude = req.query.latitude;
    let longitude = req.query.longitude;
    if (latitude === undefined || longitude === undefined) {

    } else if (isNaN(latitude) || isNaN(longitude)) {
        console.log(ERR.LOC_NOT_VALID_ERROR);
        res.send({
            pop_up_error: ERR.LOC_NOT_VALID_ERROR
        });
    } else {
        let center = [latitude, longitude];

        Post.find({
            "location": {
                "$geoWithin": {
                    "$center": [center, radius]
                }
            }
        })
            .sort({
                hotness: -1
            })
            .limit(10)
            .exec(function (err, post) {
                if (err) {
                    res.send(err);
                } else {
                    send(req, res, post, person);
                }
            });
    }
};

exports.list_hot_posts = function (req, res) {
    fetch_user(req, res, show_hot_posts);
};