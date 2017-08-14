var express = require("express"),
    app = express(),
    router = express.Router(),
    User = require("./../../models/unagiModel").users,
    Auth = require("./../../models/unagiModel").auths,
    config = require("./../../../config"),
    unagi = require("./../../controllers/unagiController"),
    auth = require("./../controllers/authController"),
    jwt = require("jsonwebtoken");

app.set("superSecret", config.secret);
var mongoose = require("mongoose"),
    Info = mongoose.model("Info");

var add_user_to_database = function(req, res, id) {
    var newUser = new User({
        id: id,
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
        // UUID: req.body.IMEI
    });

    // save the user
    newUser.save(function(err) {
        if (err) throw err;

        console.log("User saved successfully");
        res.json({
            success: true
        });
    });
};

exports.signup = function(req, res) {
    Info.findOne({}, function(err, info) {
        if (err) {
            res.send(err);
        } else if (info === null) {
            Info.findOneAndUpdate(
                {},
                {
                    $set: {
                        number_of_post_requests: 1000,
                        number_of_user_requests: 1000
                    }
                },
                { upsert: true, new: true },
                function(err, info) {
                    if (err) {
                        res.send(err);
                    } else {
                        let id = info.number_of_user_requests;
                        add_user_to_database(req, res, id);
                    }
                }
            );
        } else {
            Info.findOneAndUpdate(
                {},
                { $inc: { number_of_user_requests: 1 } },
                { upsert: true, new: true },
                function(err, info) {
                    if (err) {
                        res.send(err);
                    } else {
                        let id = info.number_of_user_requests;
                        add_user_to_database(req, res, id);
                    }
                }
            );
        }
    });
};
