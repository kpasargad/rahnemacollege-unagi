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

exports.signin = function(req, res, next) {
    // find the user
    User.findOne(
        {
            username: req.body.username
        },
        function(err, user) {
            if (err) throw err;

            if (!user) {
                res.json({
                    success: false,
                    message: "Authentication failed. User not found."
                });
            } else if (user) {
                // check if password matches
                req.body.email = user.email;
                var checkpassword = function(req, res, id, password) {
                    if (user.password != password) {
                        res.json({
                            success: false,
                            message: "Authentication failed. Wrong password."
                        });
                    } else {
                        req.user = {};
                        // if user is found and password is right
                        req.user.user_id = user.id;
                        req.user.imei = req.body.imei;
                        next();
                    }
                };
                hash.encrypt(req, res, user.id, checkpassword);
            }
        }
    );
};

//Add client to the collection after each login
exports.serializeClient = function(req, res, next) {
    Auth.findOneAndUpdate(
        { user_id: req.user.user_id, imei: req.user.imei },
        { lastLoginDate: Date.now() },
        { upsert: true, new: true },
        function(err, client) {
            if (err) throw err;
            if (!client) {
                client = new Auth();
            }
            console.log(client);
            req.user.client_id = client._id;
            next();
        }
    );
};

exports.generateAccessToken = function(req, res, next) {
    // create a token
    if (!req.user || req.user === undefined) {
        req.user = {};
        req.user.user_id = req.decoded.user_id;
    }
    var payload = {
        user_id: req.user.user_id
    };
    var accessToken = jwt.sign(payload, app.get("superSecret"), {
        expiresIn: 60 * 30 //expires in 30 minutes
    });
    console.log(req.user, accessToken);
    req.user.accessToken = accessToken;
    next();
};

exports.generateRefreshToken = function(req, res, next) {
    var payload = {
        user_id: req.user.user_id,
        client_id: req.user.client_id
    };
    var refreshToken = jwt.sign(payload, app.get("superSecret"), {
        expiresIn: 60 * 60 * 24 * 30 //expires in a month
    });
    console.log("******************", req.user, refreshToken);
    req.user.refreshToken = refreshToken;
    next();
};

exports.storeRefreshToken = function(req, res, next) {
    Auth.findOneAndUpdate(
        { _id: req.user.client_id },
        { refreshToken: req.user.refreshToken },
        function(err, client) {
            if (err) throw err;
            else {
                console.log("User's login credential saved successfully");
                console.log(client);
            }
        }
    );
    next();
};

exports.respond = function(req, res) {
    res
        .status(200)
        .json({
            success: true,
            message: "Enjoy your tokens!",
            user_id: req.user_id,
            client_id: req.user.client_id,
            refreshToken: req.user.refreshToken,
            accessToken: req.user.accessToken
        })
        .end();
};
