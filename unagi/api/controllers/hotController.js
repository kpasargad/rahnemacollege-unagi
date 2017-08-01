'use strict';

var checkToken = require('./tokenCheck').check_token;
var Post = mongoose.model('Posts');

var hotness = function (post) {
    likes = post.number_of_likes;
    date = post.timestamp;
    var order = log(max(likes, 1), 10);
    var seconds = date - 1134028003;
    return round(order + seconds / 45000, 7);
};

exports.hotness = hotness;

exports.list_hot_posts = function (req, res) {
    var callback = function (person) {
        Post.find()
            .sort({
                hotness: 1
            })
            .limit(10)
            .exec(err, function (err, post) {
                if (err) {
                    res.send(err);
                } else {
                    //TODO
                }
            });
    };
    checkToken(req, res, callback);
};