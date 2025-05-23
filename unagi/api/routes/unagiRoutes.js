"use strict";

var express = require("express"),
    app = express(),
    router = express.Router(),
    User = require("./../models/unagiModel").users,
    config = require("./../../config"),
    listLazy = require("./../controllers/post/listLazy"),
    hotPosts = require("./../controllers/post/hotPosts"),
    createPost = require("./../controllers/post/createPost"),
    singleRead = require("./../controllers/post/singleRead"),
    myPosts = require("./../controllers/post/myPosts"),
    myLikes = require("./../controllers/post/myLikes"),
    activity = require("./../controllers/post/activity"),
    jwt = require("jsonwebtoken"),
    userValidator = require("./../services/validators/createUserVal")
        .user_sign_up_val,
    signinModule = require("./../services/authentication/signin"),
    signupModule = require("./../services/authentication/signup"),
    authModule = require("./../services/authentication/authenticate"),
    signoutModule = require("./../services/authentication/signout");

app.set("superSecret", config.secret);

router.get("/", function(req, res) {
    res.send("Welcome to root");
});

router.post("/signup", function(req, res) {
    userValidator(req, res, signupModule.signup);
});

router.post(
    "/signin",
    signinModule.signin,
    signinModule.serializeClient,
    signinModule.generateAccessToken,
    signinModule.generateRefreshToken,
    signinModule.storeRefreshToken,
    signinModule.respond
);

router.post(
    "/signout",
    authModule.authenticateAccessToken,
    signoutModule.deleteClient
);

router.post(
    "/getaccesstoken",
    authModule.authenticateRefreshToken,
    signinModule.generateAccessToken,
    signinModule.respond
);

// route middleware to verify a token
router.use("/api", authModule.authenticateAccessToken);

router.get("/api/users", function(req, res) {
    User.find({}, function(err, users) {
        console.log(users);
        res.json(users);
    });
});

router.get("/api/checktoken", authModule.authenticateAccessToken, function(
    req,
    res
) {
    res.status(200).json({
        success: true,
        message: "Authentication was successful."
    });
});

router.get("/api/posts", listLazy.list_lazy);

router.post("/api/posts", createPost.create_a_post);

router.get("/api/posts/:postId", singleRead.read_a_post);

router.get("/api/hot", hotPosts.list_hot_posts);

router.get("/api/myposts", myPosts.my_posts);

router.get("/api/mylikes", myLikes.my_likes);

//router.get("api/posts/liked", unagi.liked_posts);

router.post("/api/posts/activity", activity.activity);

module.exports.router = router;
