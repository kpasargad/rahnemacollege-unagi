'use strict';
var mongoose = require('mongoose'),
    PostModel = mongoose.model('Posts'),
    LikeModel = mongoose.model('Actions');


/**
 * This function adds the parent_text to every post in array of posts
 * @param res
 * @param posts
 */
var setParentText = function (res, posts) {
    let length = posts.length;
    if (length === 0) {
        res.send([])
    } else {
        var donePosts = 0;
        for (var i = 0; i < length; i++) {
            var post = posts[i];
            var postHandler = function (post) {
                PostModel.find({
                    _id: post._id
                }).populate('parent_id').exec(function (err, postWithParent1) {
                    let postWithParent = postWithParent1[0];
                    if (err) {
                        res.send(err);
                    } else {
                        post.parent_text = (postWithParent.parent_id === undefined) ? undefined :postWithParent.parent_id.text;
                        post._id = undefined;
                        donePosts++;
                        if (donePosts === length) {
                            res.send(posts);
                        }
                    }
                });
            };
            postHandler(post);
        }
    }
};

/**
 * This function sets the likes of an array of posts
 * @param res
 * @param posts
 * @param user
 */
var setLikes = function (res, posts, user) {
    let length = posts.length;
    if (length === 0) {
        res.send([])
    } else {
        var donePosts = 0;
        for (var i = 0; i < length; i++) {
            var post = posts[i];
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
                        post.like_id = (like !== null) ? like.id : undefined;
                        donePosts++;
                        if (donePosts === length) {
                            setParentText(res, posts);
                        }
                    }
                });
            };
            postHandler(post);
        }
    }
};

/**
 * This function handles to-be-sent posts.
 * Token's stuff has to be handled before this.
 * @param res
 * @param req
 * @param posts
 * @param user
 */
var sendPosts = function (req, res, posts, user) {
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
                    _id: post._id,
                    id: post.id,
                    text: post.text,
                    author_id: post.author_id,
                    location: post.location,
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
                    setLikes(res, sendingPosts, user);
                }
            };
            postHandler(post);
        }
    }
};
exports.send = sendPosts;

/**
 * This function is used to send the fields of a reading single post request
 * @param res
 * @param main_post
 * @param children
 * @param fathers
 */
function sendChildrenAndFathers(res, main_post, children, fathers) {
    res.send({
        main_post: main_post,
        children: children,
        fathers: fathers
    })
}

/**
 * This function adds the likes of fathers
 * @param res
 * @param main_post
 * @param children
 * @param fathers
 * @param user
 */
var setLikesOfFathers = function (res, main_post, children, fathers, user) {
    let fathersLength = fathers.length;
    if (fathersLength === 0) {
        sendChildrenAndFathers(res, main_post, children, fathers);
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
                        post.like_id = (like !== null) ? like.id : undefined;
                        post._id = undefined;
                        doneFathers++;
                        if (doneFathers === fathersLength) {
                            sendChildrenAndFathers(res, main_post, children, fathers);
                        }
                    }
                });
            };
            postHandler(post);
        }
    }
};

/**
 * This function adds likes of children posts
 * @param res
 * @param main_post
 * @param children
 * @param fathers
 * @param user
 */
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
            main_post.like_id = (like !== null) ? like.id : undefined;
            main_post._id = undefined;

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
                                post.like_id = (like !== null) ? like.id : undefined;
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
        }
    });
};

/**
 * This recursive function finds all fathers of the post.
 * @param res
 * @param main_post
 * @param children
 * @param fathers
 * @param user
 */

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

/**
 * This function finds the children of the post the user wants to see
 * @param res
 * @param main_post
 * @param childrenPosts
 * @param user
 * @param addFathersAndSend
 */
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

/**
 * This function finds the post the user wants to see
 * @param req
 * @param res
 * @param mainPost
 * @param user
 */
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