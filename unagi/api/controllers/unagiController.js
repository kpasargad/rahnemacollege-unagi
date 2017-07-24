'use strict';


var mongoose = require('mongoose'),
    Post = mongoose.model('Posts'),
    User = mongoose.model('Users');

var assert = require('assert');

///
var list_all_posts = function (req, res) {
    Post.find({}, function (err, post) {
        if (err)
            res.send(err);
        res.json(post);
    });
};
exports.list_all_posts = list_all_posts;


exports.create_a_post = function (req, res) {
    Post.findOne().sort({id: -1}).exec(function (err, post_with_highest_id) {
        if (err) {
            res.send(err)
        }
        else if(req.body.location === undefined) {
            res.send("No location has been sent");
        }else {
            var id = 1;
            if (post_with_highest_id === null) {
                //do nothing
            } else {
                id = post_with_highest_id.id + 1;
            }
            var new_post = new Post({
                id: id,
                text: req.body.text,
                location: req.body.location
            });

            var error = new_post.validateSync();
            //console.log(error);
            if(error === undefined){
                new_post.save(function (err, post) {
                    if (err)
                        res.send(err);
                    res.json(post);
                });
                console.log("new post:" + new_post);
            }
            else {
                console.log("new post is not valid.")
                res.send(error.errors);
            }
        }
    });
};


exports.read_a_post = function (req, res) {
    Post.findById(req.params.postId, function (err, post) {
        if (err)
            res.send(err);
        res.json(post);
    });
};


exports.update_a_post = function (req, res) {
    Post.findOneAndUpdate({_id: req.params.postId}, req.body, {new: true}, function (err, post) {
        if (err)
            res.send(err);
        res.json(post);
    });
};


exports.delete_a_post = function (req, res) {


    Post.remove({
        _id: req.params.postId
    }, function (err, post) {
        if (err)
            res.send(err);
        res.json({message: 'Post successfully deleted'});
    });
};

var create_a_user = function (req, res) {
    var token = req.params.token;
    User.findOne().sort({id: -1}).exec(function (err, person) {
        if (err) {
            res.send(err)
        }
        else {
            var id = 1;
            if (person === null) {
                //do nothing
            } else {
                id = person.id + 1;
            }

            var new_user = new User({
                token: req.params.token,
                id: id
            });

            new_user.save(function (err, user) {
                if (err)
                    res.send(err);
                res.json(user);
            });
        }
    });
};

//exports.create_a_user = create_a_user;

exports.check_token = function (req, res) {
    console.log("CHECKING TOKEN");
    console.log(req.params.token);
    User.findOne({'token': req.params.token}, function (err, person) {
        if (err) {
            res.send(err);
        }
        if (person === null) {
            console.log("creating new user");
            create_a_user(req, res)
        } else {
            console.log(person);
            console.log("submitted user");
            list_all_posts(req, res)
        }
    })
};