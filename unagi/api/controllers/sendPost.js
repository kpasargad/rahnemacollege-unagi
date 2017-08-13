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
                            number_of_replies: post.children_id.length
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

function sendChildrenAndFathers(res, main_post, children, fathers, user) {
    res.send({
        main_post : main_post,
        children: children,
        fathers : fathers
    })
}

var setLikesOfFathers = function(res, main_post, children, fathers, user) {
    let fathersLength = fathers.length;
    if (fathersLength === 0) {
        sendChildrenAndFathers(res, main_post, children, fathers, user);
    } else {
        var doneFathers = 0;
        for (var i = 0; i < fathersLength; i++) {
            var post = fathers[i];
            var postHandler = function (post) {
                LikeModel.findOne({
                    user_id: user._id,
                    post_id: post._id,
                    like: 1
                }, function (err, like) {
                    if (err) {
                        res.send(err);
                    } else {
                        post.is_liked = (like !== null);
                        post._id = undefined;
                        doneFathers++;
                        if (doneFathers === fathersLength) {
                            sendChildrenAndFathers(res, main_post, children, fathers, user);
                        }
                    }
                });
            };
            postHandler(post);
        }
    }
};

var setLikesOfChildrenAndMainPost = function (res, main_post, children, fathers, user) {
    LikeModel.findOne({
        user_id: user._id,
        post_id: main_post._id,
        like: 1
    }, function (err, like) {
        if (err) {
            res.send(err);
        } else {
            main_post.is_liked = (like !== null);
            main_post._id = undefined;
        }
    });

    let childrenLength = children.length;
    if (childrenLength === 0) {
        setLikesOfFathers(res, main_post, children, fathers, user);
    } else {
        var doneChildren = 0;
        for (var i = 0; i < childrenLength; i++) {
            var post = children[i];
            var postHandler = function (post) {
                LikeModel.findOne({
                    user_id: user._id,
                    post_id: post._id,
                    like: 1
                }, function (err, like) {
                    if (err) {
                        res.send(err);
                    } else {
                        console.log("LIKE : " + like);
                        post.is_liked = (like !== null);
                        post._id = undefined;
                        doneChildren++;
                        if (doneChildren === childrenLength) {
                            setLikesOfFathers(res, main_post, children, fathers, user);
                        }
                    }
                });
            };
            postHandler(post);
        }
    }
};

var addFathers = function (res, main_post, children, fathers, user) {
    console.log("Fetching Fathers");
    let current_post = (fathers.length === 0) ? main_post : fathers[fathers.length - 1];
    if (current_post.parent_id === undefined) {
        console.log(fathers[fathers.length - 1]);
        setLikesOfChildrenAndMainPost(res, main_post, children, fathers, user);
    } else {
        console.log("parent_id :" + current_post.parent_id);
        PostModel.findOne({
            id: current_post.parent_id
        }, function (err, parent) {
            console.log(parent);
            if (err) {
                res.send(err)
            } else if (parent === null) {
                res.send({
                    pop_up_error: "An error occurred while fetching fathers"
                })
            } else if (parent.parent_id !== undefined) {
                PostModel.findOne({
                    _id: parent.parent_id
                }, function (err, grandParent) {
                    if (err) {
                        res.send(err)
                    } else if (parent === null) {
                        res.send({
                            pop_up_error: "An error occurred while fetching fathers"
                        })
                    } else {
                        if (grandParent !== null) {
                            fathers[fathers.length] = {
                                _id: parent._id,
                                id: parent.id,
                                text: parent.text,
                                author_id: parent.author_id,
                                location: parent.location,
                                hotness: parent.hotness,
                                number_of_likes: parent.number_of_likes,
                                timestamp: parent.timestamp,
                                parent_id: grandParent.id,
                                number_of_replies: (parent.children_id === undefined) ? 0 : parent.children_id.length
                            };
                            addFathers(res, main_post, children, fathers, user);
                        } else {
                            fathers[fathers.length] = {
                                _id: parent._id,
                                id: parent.id,
                                text: parent.text,
                                author_id: parent.author_id,
                                location: parent.location,
                                hotness: parent.hotness,
                                number_of_likes: parent.number_of_likes,
                                timestamp: parent.timestamp,
                                parent_id: undefined,
                                number_of_replies: (parent.children_id === undefined) ? 0 : parent.children_id.length
                            };
                            addFathers(res, main_post, children, fathers, user);
                        }
                    }
                });

            } else {
                fathers[fathers.length] = {
                    _id: parent._id,
                    id: parent.id,
                    text: parent.text,
                    author_id: parent.author_id,
                    location: parent.location,
                    hotness: parent.hotness,
                    number_of_likes: parent.number_of_likes,
                    timestamp: parent.timestamp,
                    parent_id: undefined,
                    number_of_replies: (parent.children_id === undefined) ? 0 : parent.children_id.length
                };
                addFathers(res, main_post, children, fathers, user);
            }
        })
    }

};

var addChildren = function (res, main_post, childrenPosts, user, addFathersAndSend) {
    let children = [];
    let length = (childrenPosts === undefined) ? 0 : childrenPosts.length;
    if (length === 0) {
        let fathers = [];
        addFathersAndSend(res, main_post, children, fathers, user);
    } else {
        console.log("length: " + length);
        var donePosts = 0;
        for (var i = 0; i < length; i++) {
            var post = childrenPosts[i];
            console.log("Number Of Likes:" + post.number_of_likes);
            var postHandler = function (post) {
                children[donePosts] = ({
                    _id: post._id,
                    id: post.id,
                    text: post.text,
                    author_id: post.author_id,
                    location: post.location,
                    hotness: post.hotness,
                    number_of_likes: post.number_of_likes,
                    timestamp: post.timestamp,
                    parent_id: main_post.id,
                    number_of_replies: post.children_id.length
                });
                donePosts++;
                console.log("DONE POSTS:" + donePosts + " " + children);
                if (donePosts === length) {
                    let fathers = [];
                    addFathersAndSend(res, main_post, children, fathers, user);
                } else {
                    console.log(length);
                    console.log(i + "  " + (length));
                }
            };
            postHandler(post);
        }
    }
};

exports.send_a_single_post = function (req, res, mainPost, user) {
    PostModel.find({
        _id: mainPost._id
    }).populate('parent_id').exec(function (err, focusedPost1) {
        let focusedPost = focusedPost1[0];
        if (err) {
            res.send(err)
        }
        else {
            PostModel.find({parent_id: focusedPost._id})
                .exec(function (err, childrenPosts) {
                    console.log(focusedPost);
                    console.log("Children:" + focusedPost.children_id);
                    let focPostToSend = {
                        _id: focusedPost._id,
                        id: focusedPost.id,
                        text: focusedPost.text,
                        author_id: focusedPost.author_id,
                        location: focusedPost.location,
                        hotness: focusedPost.hotness,
                        number_of_likes: focusedPost.number_of_likes,
                        timestamp: focusedPost.timestamp,
                        parent_id: (focusedPost.parent_id === undefined) ? undefined : focusedPost.parent_id.id,
                        number_of_replies: (focusedPost.children_id === undefined) ? 0 : focusedPost.children_id.length
                    };
                    addChildren(res, focPostToSend, childrenPosts, user, addFathers);
                })
        }
    })
};