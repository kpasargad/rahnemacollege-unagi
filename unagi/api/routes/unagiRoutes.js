"use strict";

var express = require("express"),
  app = express(),
  router = express.Router(),
  User = require("./../models/unagiModel").users,
  config = require("./../../config"),
  unagi = require("./../controllers/unagiController"),
  auth = require("./../controllers/authController"),
  jwt = require("jsonwebtoken");

app.set("superSecret", config.secret);
var userValidator = require("./../controllers/validators/createUserVal")
  .user_sign_up_val;

router.get("/", function(req, res) {
  res.send("Welcome to root");
});

var userCB = function(req, res) {
  User.findOne().sort({ id: -1 }).exec(function(err, person) {
    if (err) {
      res.send(err);
      return undefined;
    } else {
      var id = 1;
      if (person === null) {
        //do nothing
      } else {
        id = person.id + 1;
      }
      var newUser = new User({
        id: id,
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
        // UUID: req.body.IMEI
      });

      // save the sample user
      newUser.save(function(err) {
        if (err) throw err;

        console.log("User saved successfully");
        res.json({
          success: true
        });
      });
    }
  });
};
router.post("/signup", function(req, res) {
  userValidator(req, res, userCB);
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

router.get("/api/posts", unagi.list_lazy);

router.post("/api/posts", unagi.create_a_post);

router.get("/api/posts/:postId", unagi.read_a_post);

router.get("/api/hot", unagi.list_hot_posts);

router.post("/api/posts/activity", unagi.activity);

module.exports.router = router;
