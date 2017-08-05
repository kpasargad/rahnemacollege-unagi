var check_token = require('./tokenCheck').check_token;

var ERR = require('./consts/errConsts');

var mongoose = require('mongoose'),
    Post = mongoose.model('Posts'),
    Actions = mongoose.model('Actions');
var hotnessBaseValue = require('./hotController').hotnessBaseValue;

var validator = require('./validators/createPostVal').createPostVal;

var postCreationCallBack = function (req, res, post_with_highest_id, person) {
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
        hotness: hotnessBaseValue(Date.now())
    });
    console.log("new post:" + new_post);
    new_post.save(function (err, post) {
        if (err) {
            console.log("error in saving the post.");
            res.send(err);
        } else {
            console.log("post is saved.");
            res.json(post);
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
            validator(req, res, person, postCreationCallBack);
        }
    };
    check_token(req, res, callback);
};

exports.create_a_post = create_a_post;