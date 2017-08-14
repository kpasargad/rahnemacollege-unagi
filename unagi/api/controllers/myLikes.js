'use strict';


//app constants:
const POST_PER_REQ = require('./consts/appConsts').POST_PER_REQ;

const ERR = require('./consts/errConsts');

//Other:
var mongoose = require('mongoose'),
    Post = mongoose.model('Posts'),
    Actions = mongoose.model('Actions');
var send = require('./sendPost').send;

var fetch_user = require('./tokenCheck').fetch_user;
exports.fetch_user = fetch_user;


var my_likes = function (req, res) {
    var callback = (function (req, res, person) {
        if (person === undefined) {
            res.send({
                pop_up_error: ERR.USER_ERROR
            });
        } else {
            console.log(person);
            console.log("Someone has requested to see their posts ");
            let lastPost = req.query.lastlikeid;
            if (lastPost === undefined) {
                res.send({
                    pop_up_error: ERR.LAST_POST_NOT_FOUND_ERROR
                })
            } else if (isNaN(lastPost)) {
                res.send({
                    pop_up_error: ERR.LAST_POST_NOT_VALID_ERROR
                })
            } else {
                // var q = post.find({"loc":{"$geoWithin":{"$center":[center, radius]}}}.skip(0).limit(POST_PER_REQ))
                Actions.find({
                    "user_id": person._id,
                    "like": 1,
                    "id": {
                        $lt: lastPost
                    }
                }).populate('post_id').sort({id: -1}).limit(POST_PER_REQ).exec(function (err, likes) {
                    var post = likes.map(function (item) {
                        return item.post_id
                    });
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
                });
            }
        }
    });
    fetch_user(req, res, callback);
};
exports.my_likes = my_likes;