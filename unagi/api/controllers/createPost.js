var fetch_user = require("./tokenCheck").fetch_user;

var ERR = require("./consts/errConsts");

var mongoose = require("mongoose"),
    Post = mongoose.model("Posts"),
    Actions = mongoose.model("Actions"),
    Info = mongoose.model("Info");

var hotnessBaseValue = require("./hotController").hotnessBaseValue;

var validator = require("./validators/createPostVal").createPostVal;

/**
 * This function adds the post to the database
 * @param req
 * @param res
 * @param id
 * @param person
 * @param parent
 */
var add_post_to_database = function(req, res, id, person, parent) {
    var new_post = new Post({
        id: id,
        text: req.body.text,
        location: {
            type: "Point",
            coordinates: [req.body.Latitude, req.body.Longitude]
        },
        author_id: person.id,
        timestamp: Date.now(),
        hotness: hotnessBaseValue(Date.now()),
        parent_id: parent_id
    });
    console.log("new post:" + new_post);
    new_post.save(function(err, post) {
        if (err) {
            console.log(err);
            console.log("error in saving the post.");
            res.send(err);
        } else {
            console.log("post is saved.");
            if (parent !== undefined) {
                Post.findOneAndUpdate(
                    { _id: parent._id },
                    { $push: { children_id: post._id } },
                    { new: true },
                    function(err, updated_parent) {
                        if (err) {
                            res.send(err);
                        } else {
                            console.log(updated_parent);
                            res.send({
                                success: true
                            });
                        }
                    }
                );
            } else {
                res.send({
                    success: true
                });
            }
        }
    });
};

/**
 * This function fetches the id of the post
 * @param req
 * @param res
 * @param person
 * @param parent
 */
var postCreationCallBack = function(req, res, person, parent) {
    console.log("post creation person :" + person);
    console.log("post creation parent :" + parent);
    parent_id = parent === undefined ? undefined : parent._id;
    console.log("parent : " + parent);
    Info.findOne({}, function(err, info) {
        if (err) {
            res.send(err);
        } else if (info === null) {
            Info.findOneAndUpdate(
                {},
                {
                    $set: {
                        number_of_actions_requests: 2000,
                        number_of_user_requests: 2000,
                        number_of_post_requests: 2000
                    }
                },
                { upsert: true, new: true },
                function(err, info) {
                    if (err) {
                        res.send(err);
                    } else {
                        let id = info.number_of_actions_requests;
                        add_post_to_database(req, res, id, person, parent);
                    }
                }
            );
        } else {
            Info.findOneAndUpdate(
                {},
                { $inc: { number_of_actions_requests: 1 } },
                { upsert: true, new: true },
                function(err, info) {
                    if (err) {
                        res.send(err);
                    } else {
                        let id = info.number_of_actions_requests;
                        add_post_to_database(req, res, id, person, parent);
                    }
                }
            );
        }
    });
};

/**
 * This is the main function to handle post creation requests and checks whether the user exists or not
 * @param req
 * @param res
 * @param person
 */
var mainCallBack = function(req, res, person) {
    if (person === undefined) {
        console.log(ERR.USER_ERROR);
        res.send({
            pop_up_error: ERR.USER_ERROR
        });
    } else {
        console.log("CREATE" + person);
        validator(req, res, person, postCreationCallBack);
    }
};

var create_a_post = function(req, res) {
    fetch_user(req, res, mainCallBack);
};

exports.create_a_post = create_a_post;
