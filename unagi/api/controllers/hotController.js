'use strict';

var checkToken = require('./tokenCheck').check_token;
Post = mongoose.model('Posts');

var hotness = function (likes, date) {
    var order = log(max(likes, 1), 10);
    var seconds = date - 1134028003;
    return round(order + seconds / 45000, 7);
};

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
                    hotness(post.number_of_likes, post.timestamp) = hotness
                }
            });
    }
    checkToken(req, res, callback);
}