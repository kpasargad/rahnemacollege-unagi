var express = require('express');
var router = express.Router();

var Post = require("../data/post");

var post1 = new Post({
    unique_id : 1,
    post : "salam",
    pointX : 10,
    pointX : 15
});

var User = require("../data/user");

var user1 = new User({
    unique_id : 1,
    token : "adhaudukhaedfkuahfiu"
});




/* GET users listing. */
router.get('/', function(req, res, next) {
  post1.save();
  user1.save();
  res.send('respond with a resource');

});

module.exports = router;
