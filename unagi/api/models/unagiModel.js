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
        type : {type : String},
        coordinates : {
            type : [Number]
        }
    },
    author_id : {
        type : Number,
        required : true
    }
});

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

module.exports = {
    posts: mongoose.model('Posts', PostSchema),
    users: mongoose.model('Users', UserSchema)
};