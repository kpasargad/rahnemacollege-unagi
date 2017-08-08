'use strict';
var mongoose = require('mongoose'),
    PostModel = mongoose.model('Posts'),
    UserModel = mongoose.model('Users'),
    LikeModel = mongoose.model('Actions');

/**
 * This function handles to-be-sent posts.
 * Token's stuff has to be handled before this.
 * @param res
 * @param req
 * @param posts
 * @param user
 */
var sendPosts = function (req, res, posts, user) {
    //console.log("RAW POSTS:" + posts);
    LikeModel.find({
        user_id: user._id,
        like: 1
    }).populate('post_id').exec(function (err, likedPosts) {
        if (err) {
            res.send(err);
        }
        else {
            var ids = [...new Set(likedPosts.map(function (item) {
                if (item !== undefined && item.like === 1) {
                    return item.post_id.id
                } else {
                    return undefined;
                }
            }))];
            console.log("ids" + ids);
            var sendingPosts = [];
            var length = posts.length;
            if (length === 0) {
                res.send([]);
            } else {
                console.log("length: " + length);
                var donePosts = 0;
                for (var i = 0; i < length; i++) {
                    var post = posts[i];
                    console.log("Number Of Likes:" + post.number_of_likes);
                    var postHandler = function (post) {
                        sendingPosts[donePosts] = ({
                            id: post.id,
                            text: post.text,
                            author_id: post.author_id,
                            location: post.location,
                            is_liked: (ids.indexOf(post.id) > -1),
                            hotness: post.hotness,
                            number_of_likes: post.number_of_likes,
                            timestamp: post.timestamp
                        });
                        donePosts++;
                        console.log("DONE POSTS:" + donePosts + " " + sendingPosts);
                        if (donePosts === length) {
                            console.log("SENDING POSTS...");
                            console.log(sendingPosts);
                            res.send(sendingPosts);
                        } else {
                            console.log(length);
                            console.log(i + "  " + (length));
                        }
                    };
                    postHandler(post);
                }
            }
        }
    })
};
exports.send = sendPosts;

exports.send_a_single_post = function (req, res, focusedPost, user) {
    //console.log("RAW POSTS:" + posts);
    console.log(focusedPost);
    console.log("Children Ids : " + focusedPost.children_id);
    LikeModel.find({
        user_id: user._id,
        like: 1
    }, function (err, likedPosts) {
        if (err) {
            res.send(err);
        }
        else {
            var ids = [...new Set(likedPosts.map(function (item) {
                if (item !== undefined && item.like === 1) {
                    return item.post_id.id;
                } else {
                    return undefined;
                }
            }))];
            console.log(ids);
            PostModel.findOne({_id : focusedPost._id}).populate('children_id').exec(function (err, focPost) {
                console.log(focPost);
                console.log("Children:" + focPost.children_id);
                let posts = focPost.children_id;
                let sendingPosts = [];
                let length = (posts === undefined) ? 0 : posts.length;
                let focPostToSend = {
                    id: focPost.id,
                    text: focPost.text,
                    author_id: focPost.author_id,
                    location: focPost.location,
                    is_liked: (ids.indexOf(focPost.id) > -1),
                    hotness: focPost.hotness,
                    number_of_likes: focPost.number_of_likes,
                    timestamp: focPost.timestamp
                };
                if (length === 0) {
                    res.send({
                        main_post: focPostToSend,
                        children: []
                    });
                } else {
                    console.log("length: " + length);
                    var donePosts = 0;
                    for (var i = 0; i < length; i++) {
                        var post = posts[i];
                        console.log("Number Of Likes:" + post.number_of_likes);
                        var postHandler = function (post) {
                            sendingPosts[donePosts] = ({
                                id: post.id,
                                text: post.text,
                                author_id: post.author_id,
                                location: post.location,
                                is_liked: (ids.indexOf(post.id) > -1),
                                hotness: post.hotness,
                                number_of_likes: post.number_of_likes,
                                timestamp: post.timestamp
                            });
                            donePosts++;
                            console.log("DONE POSTS:" + donePosts + " " + sendingPosts);
                            if (donePosts === length) {
                                console.log("SENDING POSTS...");
                                console.log(sendingPosts);
                                res.send({
                                    main_post: focPostToSend,
                                    children: sendingPosts
                                });
                            } else {
                                console.log(length);
                                console.log(i + "  " + (length));
                            }
                        };
                        postHandler(post);
                    }
                }
            })
        }
    })
};