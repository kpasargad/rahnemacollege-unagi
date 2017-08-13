"use strict";

var mongoose = require("mongoose");
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
        type: {
            type: String
        },
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
        default: 0
    },
    hotness: {
        type: Number,
        default: 0
    },
    parent_id: {
        type: Schema.Types.ObjectId,
        ref: "Posts"
    },
    children_id: [
        {
            type: Schema.Types.ObjectId,
            ref: "Posts"
        }
    ],
    // src_post: {
    //     type: Schema.Types.ObjectId,
    //     ref: "Posts"
    // }
});

PostSchema.index({timestamp: -1, location: 1});
PostSchema.index({id: 1});
PostSchema.index({parent_id: 1});
PostSchema.index({author_id: 1, timestamp: -1});
PostSchema.index({hotness: 1});

var UserSchema = new Schema({
    id: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        //TODO: to be hashed
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    }
});
UserSchema.index({id: 1});
UserSchema.index({username: 1});

var actionsSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },
    post_id: {
        type: Schema.Types.ObjectId,
        ref: "Posts",
        required: true
    },
    like: {
        type: Number,
        default: 0,
        required: true
    },
    share: {
        type: Number,
        default: 0,
        required: true
    }
});

actionsSchema.index({user_id: 1, like: 1});
actionsSchema.index({
    user_id: 1,
    post_id: 1,
    like: 1
});

var authSchema = new Schema({
    user_id: {
        type: Number,
        required: true
    },
    imei: {
        type: String,
        required: true
    },
    lastLoginDate: {
        type: Date,
        default: Date.now
    },
    refreshToken: {
        type: String,
        required: true
    }
});

var infoSchema = new Schema({
    number_of_user_requests: {
        type: Number,
        default: 1000,
        required: true
    },
    number_of_post_requests: {
        type: Number,
        default: 1000,
        required: true

    }
});

module.exports = {
    posts: mongoose.model("Posts", PostSchema),
    users: mongoose.model("Users", UserSchema),
    actions: mongoose.model("Actions", actionsSchema),
    auths: mongoose.model("Auths", authSchema),
    info: mongoose.model("Info", infoSchema)
};
