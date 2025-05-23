'use strict';

const ERR = require('./consts/errConsts');

//Other:
var mongoose = require('mongoose'),
    Post = mongoose.model('Posts'),
    Actions = mongoose.model('Actions');

var fetch_user = require('./tokenCheck').fetch_user;
exports.fetch_user = fetch_user;

/**
 * This function gives all of the posts in json
 * It shouldn't be used in the final version
 * @param req
 * @param res
 */
var list_all_posts = function (req, res) {
    Post.find({}, function (err, post) {
        if (err)
            res.send(err);
        res.json(post);
    });
};
exports.list_all_posts = list_all_posts;