var send_a_single_post = require('./sendPost').send_a_single_post;
var mongoose = require('mongoose'),
    Post = mongoose.model('Posts'),
    Actions = mongoose.model('Actions');

var fetch_user = require('./tokenCheck').fetch_user;

const ERR = require('./consts/errConsts');

var callback = function (req, res, person) {
    console.log("PERSON" + person);

    if (person !== undefined) {
        Post.findOne({
            id: req.params.postId
        }, function (err, post) {
            if (err) {
                res.send(err);
            } else {
                send_a_single_post(req, res, post, person);
            }
        });
    } else {
        res.send({
            pop_up_error: ERR.USER_ERROR
        })
    }
};
exports.read_a_post = function (req, res) {
    fetch_user(req, res, callback);
};