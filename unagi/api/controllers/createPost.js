var check_token = require('./tokenCheck').check_token;

var ERR = require('./consts/errConsts');

var mongoose = require('mongoose'),
    Post = mongoose.model('Posts'),
    Like = mongoose.model('Likes'),
    Actions = mongoose.model('Actions');

const CHARACTERS_BOUND = require('./consts/appConsts').CHARACTERS_BOUND;
var hotnessBaseValue = require('./hotController').hotnessBaseValue;

var create_a_post = function (req, res) {
    var callback = function (person) {
        if (person === undefined) {
            console.log(ERR.USER_ERROR);
            res.send({
                pop_up_error: ERR.USER_ERROR
            });
        } else {
            Post.findOne().sort({
                id: -1
            }).exec(function (err, post_with_highest_id) {
                if (err) {
                    res.send(err)
                } else if (req.body.Longitude === undefined || req.body.Latitude === undefined) {
                    console.log({
                        pop_up_error: ERR.LOC_NOT_FOUND_ERROR
                    });
                    res.send({
                        pop_up_error: ERR.LOC_NOT_FOUND_ERROR
                    });
                } else if (req.body.text === undefined) {
                    console.log(ERR.TEXT_ERROR);
                    res.send({
                        pop_up_error: ERR.TEXT_ERROR
                    });
                } else if (req.body.text.length > CHARACTERS_BOUND) {
                    console.log(ERR.NUMBER_OF_CHARACTERS_ERROR);
                    res.send({
                        pop_up_error: ERR.NUMBER_OF_CHARACTERS_ERROR
                    });
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
                }
            });
        }
    };
    check_token(req, res, callback);
};
exports.create_a_post = create_a_post;