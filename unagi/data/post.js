var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    unique_id : {type : Number},
    post : {type : String},
    Location : {type : String, required : true}
});

model.exports = mongoose.model('Post', schema);