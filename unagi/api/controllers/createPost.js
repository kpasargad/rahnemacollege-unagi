var check_token = require('./tokenCheck').check_token;

var ERR = require('./consts/errConsts');

var mongoose = require('mongoose'),
    Post = mongoose.model('Posts'),
    Actions = mongoose.model('Actions');
var hotnessBaseValue = require('./hotController').hotnessBaseValue;

var validator = require('./validators/createPostVal').createPostVal;

var postCreationCallBack = function (req, res, post_with_highest_id, person, parent) {
    console.log("post creation person :" + person);
    console.log("post creation parent :" + parent);
    parent_id = (parent === undefined) ? undefined : parent._id;
    console.log("parent : " + parent);
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
            coordinates: [req.body.Latitude, req.body.Longitude]
        },
        author_id: person.id,
        timestamp: Date.now(),
        hotness: hotnessBaseValue(Date.now()),
        parent_id: parent_id
    });
    console.log("new post:" + new_post);
    new_post.save(function (err, post) {
        if (err) {
            console.log("error in saving the post.");
            res.send(err);
        } else {
            console.log("post is saved.");
            if (parent !== undefined) {
                Post.findOneAndUpdate({_id: parent._id},
                    {$push: {children_id: post._id}},
                    {new: true},
                    function (err, updated_parent) {
                        if (err) {
                            res.send(err);
                        } else {
                            console.log(updated_parent);
                            res.send({
                                success: true
                            });
                        }
                    });
            } else {
                res.send({
                    success: true
                });
            }
        }
    });
};

var create_a_post = function (req, res) {
    var callback = function (person) {
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
    check_token(req, res, callback);
};

exports.create_a_post = create_a_post;