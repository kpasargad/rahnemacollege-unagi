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
    fetch_user(req, res, callback);
};

exports.list_lazy = list_lazy;