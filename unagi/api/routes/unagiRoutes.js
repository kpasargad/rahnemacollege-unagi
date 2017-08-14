"use strict";

var express = require("express"),
  app = express(),
  router = express.Router(),
  User = require("./../models/unagiModel").users,
  config = require("./../../config"),
  unagi = require("./../controllers/unagiController"),
  auth = require("./../controllers/authController"),
  jwt = require("jsonwebtoken"),
  userValidator = require("./../controllers/validators/createUserVal")
    .user_sign_up_val;

app.set("superSecret", config.secret);

router.get("/", function(req, res) {
  res.send("Welcome to root");
});

router.post("/signup", function(req, res) {
  userValidator(req, res, auth.singup);
});

// router.post("/signup", auth.singup);
router.post("/signin", auth.signin, auth.serializeClient);

// route middleware to verify a token
router.use("/api", auth.authenticate);

router.get("/api/users", function(req, res) {
  User.find({}, function(err, users) {
    console.log(users);
    res.json(users);
  });
});

router.get("/api/checktoken", auth.authenticate, function(req, res) {
  res.end("I guess this is it.");
});

router.get("/api/posts", unagi.list_lazy);

router.post("/api/posts", unagi.create_a_post);

router.get("/api/posts/:postId", unagi.read_a_post);

router.get("/api/hot", unagi.list_hot_posts);

router.get("/api/myposts", unagi.my_posts);

router.get("/api/mylikes", unagi.my_likes);

//router.get("api/posts/liked", unagi.liked_posts);

router.post("/api/posts/activity", unagi.activity);

module.exports.router = router;
