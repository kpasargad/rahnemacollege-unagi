'use strict';
var mongoose = require('mongoose'),
    Post = mongoose.model('Posts'),
    User = mongoose.model('Users'),
    Like = mongoose.model('Likes');

/**
 * This function handles to-be-sent posts.
 * Token's stuff has to be handled before this.
 * @param res
 * @param req
 * @param posts
 * @param user
 */
var sendPosts = function (req, res, posts, user) {
    Like.find({
        userId: user.id
    }, function (err, LikedPosts) {
        if (err) {
            res.send(err);
        }
        else {
            var ids = [...new Set(LikedPosts.map(function (item) {
                if (item !== undefined) {
                    return item.postId
                } else {
                    return undefined;
                }
            }))];
            var sendingPosts = [];
            for(var i = 0; i < posts.length; i++){
                var post = posts[i];
                sendingPosts[i] = {
                    id: post.id,
                    text: post.text,
                    author_id: post.author_id,
                    location: post.location,
                    is_liked : (ids.indexOf(post.id) > -1)
                };
                if(i === posts.length - 1){
                    console.log(sendingPosts);
                    res.send(sendingPosts);
                }
            }
        }
    })
};
exports.send = sendPosts;