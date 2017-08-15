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


var fetch_my_posts = function(req, res, post, person) {
    send(req, res, post, person);
    try {
        console.log("Lastpost : ", post[post.length - 1].timestamp);
    } catch (error) {
        console.log("There's no post to see.");
    }
};


function handle_error_and_my_posts(err, req, res, post, person, lastPost) {
    if (err) {
        console.log("Request is invalid", lastPost);
        res.send(err);
    } else {
        fetch_my_posts(req, res, post, person);
    }
}

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
                Post.find({
                    "author_id" : person.id
                }, function (err, post) {
                    handle_error_and_my_posts(err, req, res, post, person, lastPost);
                }).sort({id: -1}).limit(POST_PER_REQ);
            }else if(isNaN(lastPost)){
                res.send({
                    pop_up_error: ERR.LAST_POST_NOT_VALID_ERROR
                })
            }else {
                Post.find({
                    "author_id" : person.id,
                    "id": {
                        $lt: lastPost
                    }

                }, function (err, post) {
                    handle_error_and_my_posts(err, req, res, post, person, lastPost);
                }).sort({id: -1}).limit(POST_PER_REQ);
            }
        }
    });
    fetch_user(req, res, callback);
};
exports.my_posts = my_posts;