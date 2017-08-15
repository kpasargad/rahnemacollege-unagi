"use strict";

var express = require("express"),
    app = express(),
    router = express.Router(),
    User = require("./../../models/unagiModel").users,
    Auth = require("./../../models/unagiModel").auths,
    config = require("./../../../config"),
    jwt = require("jsonwebtoken"),
    hash = require("../hash");

app.set("superSecret", config.secret);
var mongoose = require("mongoose"),
    Info = mongoose.model("Info");

/**
 * This function is used to add users to the database
 * @param req
 * @param res
 * @param id
 */

var add_user_to_database = function(req, res, id, password) {
    var newUser = new User({
        id: id,
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        password: password
    });

    // save the sample user
    newUser.save(function(err) {
        if (err) throw err;

        console.log("User saved successfully");
        res.json({
            success: true
        });
    });
};

/**
 * This function handles sign-up requests
 * @param req
 * @param res
 */
exports.signup = function(req, res) {
    Info.findOne({}, function(err, info) {
        if (err) {
            res.send(err);
        } else if (info === null) {
            Info.findOneAndUpdate(
                {},
                {
                    $set: {
                        number_of_actions_requests: 2000,
                        number_of_user_requests: 2000,
                        number_of_post_requests: 2000
                    }
                },
                { upsert: true, new: true },
                function(err, info) {
                    if (err) {
                        res.send(err);
                    } else {
                        let id = info.number_of_user_requests;
                        hash.encrypt(req, res, id, add_user_to_database);
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
                        hash.encrypt(req, res, id, add_user_to_database);
                    }
                }
            );
        }
    });
};
