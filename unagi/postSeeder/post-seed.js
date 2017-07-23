var Post = require("../data/post");

var post1 = new Post({
    unique_id : 1,
    post : "salam",
    pointX : 10,
    pointY : 15
});

post1.save();