'use strict';

const DISTANCE_RATE = 111.12;
const POST_PER_REQ = 20;
const radiusKM = 1000;

var check_token = function (req, res, callback) {
    console.log("CHECKING TOKEN");
    console.log(req.query.token);
    User.findOne({'token': req.query.token}, function (err, person) {
        if (err) {
            res.send(err);
            callback(undefined);
        }
        if (person === null) {
            console.log("creating new user");
            create_a_user(req, res, callback);
        } else {
            console.log(person);
            console.log("submitted user");
            callback(person);
        }
    })
};
module.exports.check_token = check_token;

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

var list_lazy = function (req, res) {


    var callback = (function (result) {
        if (result === undefined) {
            res.send("User error has occurred");
        }
        else if (req.query.latitude !== undefined && req.query.latitude !== undefined) {
            console.log("Someone has requested to see posts " + req.query.latitude + " " + req.query.longitude);
            let radius = radiusKM / DISTANCE_RATE;
            let center = [req.query.latitude, req.query.longitude];
            let post_itr = req.query.itr;

            // var q = post.find({"loc":{"$geoWithin":{"$center":[center, radius]}}}.skip(0).limit(POST_PER_REQ))
            Post.find({
                "location":
                    {"$geoWithin": {"$center": [center, radius]}}
            }, function (err, post) {
                if (err) return handleError(err);
                console.log(post);
                res.send(post);
            })
        } else {
            console.log("Someone has requested to see posts but has no location.")
        }

    });

    check_token(req, res, callback);
};
exports.list_lazy = list_lazy;


var create_a_post_old = function (req, res) {
    Post.findOne().sort({id: -1}).exec(function (err, post_with_highest_id) {
        if (err) {
            res.send(err)
        }
        else if (req.body.location === undefined) {
            res.send("No location has been sent");
        } else {
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
            //if (error === undefined) {
            new_post.save(function (err, post) {
                if (err) {
                    res.send(err);
                }
                else {
                    res.json(post);
                }
            });
            console.log("new post:" + new_post);
            // }
            //  else {
            //      console.log("new post is not valid.");
            //      res.send(error.errors);
            //  }
        }
    });
};

var create_a_post = function (req, res) {
    console.log(req.query.token);
    var callback = function (result) {
        if (result === undefined) {
            res.send("User error has occurred");
        }
        else {
            Post.findOne().sort({id: -1}).exec(function (err, post_with_highest_id) {
                if (err) {
                    res.send(err)
                }
                else if (req.body.Longitude === undefined || req.body.Latitude === undefined) {
                    res.send("No location has been sent");
                } else if (req.body.text === undefined) {
                    res.send("No text has been sent")
                } else if (req.body.text.length > 160) {
                    res.send("Illegal number of characters, more than 160 characters has been sent")
                } else {
                    var id = 1;
                    if (post_with_highest_id === null) {
                        //do nothing
                    } else {
                        id = post_with_highest_id.id + 1;
                    }
                    var new_post = new Post({
                        id: id,
                        text: req.body.text,
                        location: {
                            type: "Point",
                            coordinates:
                                [req.body.Latitude, req.body.Longitude]
                        }
                    });
                    new_post.save(function (err, post) {
                        if (err) {
                            res.send(err);
                        }
                        else {
                            res.json(post);
                        }
                    });
                    console.log("new post:" + new_post);
                }
            });
        }
    };

    check_token(req, res, callback);
};

exports.create_a_post = create_a_post;


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

var create_a_user = function (req, res, callback) {
    var token = req.query.token;
    User.findOne().sort({id: -1}).exec(function (err, person) {
        if (err) {
            res.send(err)
            return undefined;
        }
        else {
            var id = 1;
            if (person === null) {
                //do nothing
            } else {
                id = person.id + 1;
            }

            var new_user = new User({
                token: req.query.token,
                id: id
            });

            new_user.save(function (err, user) {
                if (err) {
                    callback(undefined);
                } else {
                    callback(new_user);
                }
            });
        }
    });
};

//exports.create_a_user = create_a_user;

