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
    hotness: {
        type: Number,
        default: 0
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

var actionsSchema = new Schema({
    userId: {
        type: Number,
        required: true
    },
    postId: {
        type: Number,
        required: true
    },
    like: {
        type: Number,
        default: 0,
        required : true
    },
    share: {
        type : Number,
        default : 0,
        required : true
    }
});

module.exports = {
    posts: mongoose.model('Posts', PostSchema),
    users: mongoose.model('Users', UserSchema),
    actions: mongoose.model('Actions', actionsSchema)
};