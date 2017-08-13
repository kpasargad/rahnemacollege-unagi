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


var my_posts = function (req, res) {
    var callback = (function (req, res, person) {
        if (person === undefined) {
            res.send({
                pop_up_error: ERR.USER_ERROR
            });
        } else {
            console.log(person);
            console.log("Someone has requested to see their posts ");
            let lastPost = req.query.lastpost;
            if(lastPost === undefined){
                res.send({
                    pop_up_error: ERR.LAST_POST_NOT_FOUND_ERROR
                })
            }else if(isNaN(lastPost)){
                res.send({
                    pop_up_error: ERR.LAST_POST_NOT_VALID_ERROR
                })
            }else {
                // var q = post.find({"loc":{"$geoWithin":{"$center":[center, radius]}}}.skip(0).limit(POST_PER_REQ))
                Post.find({
                    "timestamp": {
                        $lt: lastPost
                    },
                    "author_id" : person.id
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
                }).sort({id: -1}).limit(POST_PER_REQ);
            }
        }
    });
    fetch_user(req, res, callback);
};
exports.my_posts = my_posts;