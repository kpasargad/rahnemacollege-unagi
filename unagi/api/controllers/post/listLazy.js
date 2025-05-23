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

var fetch_user = require('./tokenCheck').fetch_user;
exports.fetch_user = fetch_user;


var fetch_lazy_posts = function(req, res, post, person) {
    send(req, res, post, person);
    try {
        console.log("Lastpost : ", post[post.length - 1].timestamp);
    } catch (error) {
        console.log("There's no post to see.");
    }
};

var handle_error_and_fetch_lazy_posts = function(err, req, res, post, person, lastPost) {
    if (err) {
        console.log("Request is invalid", lastPost);
        res.send(err);
    } else {
        fetch_lazy_posts(req, res, post, person);
    }
};

/**
 * This function handles showing recently posted posts nearby
 * @param req
 * @param res
 */
var list_lazy = function (req, res) {
    var callback = (function (req, res, person) {
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
                if(lastPost !== undefined) {
                    // var q = post.find({"loc":{"$geoWithin":{"$center":[center, radius]}}}.skip(0).limit(POST_PER_REQ))
                    Post.find({
                        "location": {
                            "$geoWithin": {
                                "$center": [center, radius]
                            }
                        },
                        "id": {
                            $lt: lastPost
                        }
                    }, function (err, post) {
                        handle_error_and_fetch_lazy_posts(err, req, res, post, person, lastPost);
                    }).sort({id : -1}).limit(POST_PER_REQ);
                }else {
                    Post.find({
                        "location": {
                            "$geoWithin": {
                                "$center": [center, radius]
                            }
                        }
                    }, function (err, post) {
                        handle_error_and_fetch_lazy_posts(err, req, res, post, person, lastPost);
                    }).sort({id : -1}).limit(POST_PER_REQ);
                }
            };
            lazyReqValidator(req, res, person, afterValidationCB);
        }
    });
    fetch_user(req, res, callback);
};

exports.list_lazy = list_lazy;