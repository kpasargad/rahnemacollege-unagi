var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    unique_id : {type : Number, required : true},
    token : {type : String, required: true}
});

module.exports = mongoose.model("User", schema);