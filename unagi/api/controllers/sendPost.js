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
                            timestamp: post.timestamp,
                            number_of_replies : post.children_id.length
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

var addFathersAndSend = function (res, likedIds, main_post, children, fathers) {
    let current_post = (fathers.length === 0) ? main_post : fathers[fathers.length - 1];
    if (current_post.parent_id === undefined) {
        console.log(fathers[fathers.length - 1]);
        res.send({
            main_post: main_post,
            children: children,
            fathers: fathers
        });
    } else {
        PostModel.findOne({
                _id: current_post.parent_id
            },
            function (err, parent) {
                if (err) {
                    res.send(err)
                } else if (parent === null) {
                    res.send({
                        pop_up_error: "An error occurred while fetching fathers"
                    })
                } else {
                    fathers[fathers.length] = {
                        id: parent.id,
                        text: parent.text,
                        author_id: parent.author_id,
                        location: parent.location,
                        is_liked: (likedIds.indexOf(parent.id) > -1),
                        hotness: parent.hotness,
                        number_of_likes: parent.number_of_likes,
                        timestamp: parent.timesstamp,
                        parent_id: parent.parent_id,
                        number_of_replies : parent.children_id.length
                    };
                    addFathersAndSend(res, likedIds, main_post, children, fathers);
                }
            })
    }

};

exports.send_a_single_post = function (req, res, focusedPost, user) {
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
                    console.log("ITEM:" + item.post_id);
                    return item.post_id.id;
                } else {
                    return undefined;
                }
            }))];
            PostModel.find({parent_id: focusedPost._id}).exec(function (err, posts) {
                console.log(focusedPost);
                console.log("Children:" + focusedPost.children_id);
                let children = [];
                let length = (posts === undefined) ? 0 : posts.length;
                let focPostToSend = {
                    id: focusedPost.id,
                    text: focusedPost.text,
                    author_id: focusedPost.author_id,
                    location: focusedPost.location,
                    is_liked: (ids.indexOf(focusedPost.id) > -1),
                    hotness: focusedPost.hotness,
                    number_of_likes: focusedPost.number_of_likes,
                    timestamp: focusedPost.timestamp,
                    parent_id : focusedPost.parent_id,
                    number_of_replies : focusedPost.children_id.length
                };
                if (length === 0) {
                    let fathers = [];
                    addFathersAndSend(res, ids, focPostToSend, children, fathers);
                } else {
                    console.log("length: " + length);
                    var donePosts = 0;
                    for (var i = 0; i < length; i++) {
                        var post = posts[i];
                        console.log("Number Of Likes:" + post.number_of_likes);
                        var postHandler = function (post) {
                            children[donePosts] = ({
                                id: post.id,
                                text: post.text,
                                author_id: post.author_id,
                                location: post.location,
                                is_liked: (ids.indexOf(post.id) > -1),
                                hotness: post.hotness,
                                number_of_likes: post.number_of_likes,
                                timestamp: post.timesstamp,
                                parent_id : post.parent_id,
                                number_of_replies : post.children_id.length
                            });
                            donePosts++;
                            console.log("DONE POSTS:" + donePosts + " " + children);
                            if (donePosts === length) {
                                let fathers = [];
                                addFathersAndSend(res, ids, focPostToSend, children, fathers);
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