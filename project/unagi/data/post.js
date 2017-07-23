var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    unique_id : {type : Number},
    post : {type : String},

});

model.exports = mongoose.model('User', schema);