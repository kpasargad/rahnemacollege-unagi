var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var schema = new Schema({
    unique_id : {type : Number, required : true},
    post : {type : String, required : true},
    pointX : {type : Number},
    pointY : {type : Number}
});

module.exports = mongoose.model('Post', schema);

