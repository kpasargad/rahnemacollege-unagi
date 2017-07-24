'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var PostSchema = new Schema({
    text: {
        type: String,
        default: "Just for TEST"
    },
    location: String,
    created_date:{
        type:Date,
        default:Date.now
    }
});

module.exports = mongoose.model('Posts', PostSchema);