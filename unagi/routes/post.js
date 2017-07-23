var express = require('express');
var router = express.Router();
/* GET home page. */
 router.get('/send', function (req , res , next) {
     var post = req.query.userPost
     var user = req.query.userName
     var location = req.query.postLocation

     getPost(post , user , location , addPost);


 });
function getPost(post , user , location  , next ){
    console.log(post , "   " , user , "  " , location);
    next(post,user,location);
}
function addPost(post, user , location){
    console.log("add ");
    var data = {
        "userPost" : post,
        "userName" : user,
        "postLocation" : location


    };
    return data;

}


module.exports = router;