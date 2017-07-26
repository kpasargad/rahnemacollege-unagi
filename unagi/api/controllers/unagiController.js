'use strict';

const DISTANCE_RATE = 111.12;
const POST_PER_REQ = 20;
const radiusKM = 1000;
const USER_ERROR = "User error has occurred";
const LOC_ERROR = "No location has been sent.";
const TEXT_ERROR = "No text has been sent";
const NUMBER_OF_CHARACTERS_ERROR = "Illegal number of characters, more than 160 characters has been sent";
const CHARACTERS_BOUND = 160;

/*returns a new user or the associated existing user.
* returns undefined in case of error
* */
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
            res.send(USER_ERROR);
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

var create_a_post = function (req, res) {
    var callback = function (person) {
        if (person === undefined) {
            console.log(USER_ERROR);
            res.send(USER_ERROR);
        }
        else {

            Post.findOne().sort({id: -1}).exec(function (err, post_with_highest_id) {
                if (err) {
                    res.send(err)
                }
                else if (req.body.Longitude === undefined || req.body.Latitude === undefined) {
                    console.log(LOC_ERROR);
                    res.send(LOC_ERROR);
                } else if (req.body.text === undefined) {
                    console.log(TEXT_ERROR);
                    res.send(TEXT_ERROR);
                } else if (req.body.text.length > CHARACTERS_BOUND) {
                    console.log(NUMBER_OF_CHARACTERS_ERROR);
                    res.send(NUMBER_OF_CHARACTERS_ERROR);
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
                        },
                        author_id : person.id
                    });
                    console.log("new post:" + new_post);
                    new_post.save(function (err, post) {
                        if (err) {
                            console.log("error in saving the post.");
                            res.send(err);
                        }
                        else {
                            console.log("post is saved.");
                            res.json(post);
                        }
                    });
                }
            });
        }
    };

    check_token(req, res, callback);
};

exports.create_a_post = create_a_post;

exports.read_a_post = function (req, res) {
    var callback = function (person) {
        if (person !== undefined) {
        Post.findById(req.query.postId, function (err, post) {
            if (err) {
                res.send(err);
            } else {
                res.json(post);
            }
        });
        }else {
            res.send(USER_ERROR)
        }
    };

    check_token(req, res, callback);
};

//NOT-USED
exports.update_a_post = function (req, res) {
    var callback = function (person) {
        if (person !== undefined) {
            Post.findOneAndUpdate({_id: req.query.postId}, req.body, {new: true}, function (err, post) {
                if (err)
                    res.send(err);
                res.json(post);
            });
        }else {
            res.send(USER_ERROR)
        }
    };
    check_token(req, res, callback);
};


exports.delete_a_post = function (req, res) {
    Post.remove({
        _id: req.query.postId
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

