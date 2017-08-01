'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var PostSchema = new Schema({
    id: {
        type: Number,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    location: {
        type: {type: String},
        coordinates: {
            type: [Number]
        }
    },
    author_id: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Number,
        default: Date.now
    },
    number_of_likes: {
        type: Number,
        default: 0,
    },
    hotness:{
        type : Number,
        default : 0
    }
});
PostSchema.index({"timestamp": -1, "location": 1});

var UserSchema = new Schema({
    id: {
        type: Number,
        required: true
    },
    token: {
        type: String,
        required: true
    }
});

var UsersPostsLikesSchema = new Schema({
    postId: {
        type: Number,
        required: true
    },
    userId: {
        type: Number,
        required: true
    }
});

module.exports = {
    posts: mongoose.model('Posts', PostSchema),
    users: mongoose.model('Users', UserSchema),
    likes: mongoose.model('Likes', UsersPostsLikesSchema)
};