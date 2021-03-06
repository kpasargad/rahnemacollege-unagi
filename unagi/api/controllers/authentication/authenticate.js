"use strict";

var express = require("express"),
    app = express(),
    router = express.Router(),
    User = require("./../../models/unagiModel").users,
    Auth = require("./../../models/unagiModel").auths,
    config = require("./../../../config"),
    jwt = require("jsonwebtoken");

app.set("superSecret", config.secret);
var mongoose = require("mongoose"),
    Info = mongoose.model("Info");

exports.authenticateRefreshToken = function(req, res, next) {
    // check header or url parameters or post parameters for token
    var token =
        req.body.token || req.query.token || req.headers["x-access-token"];

    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, app.get("superSecret"), function(err, decoded) {
            if (err) {
                return res.status(401).json({
                    success: false,
                    token_invalid: true,
                    message: "Failed to authenticate token."
                });
            } else {
                Auth.findOne({ _id: decoded.client_id }, function(err, client) {
                    if (err) throw err;
                    if (!client) {
                        return res
                            .status(403)
                            .json({
                                success: false,
                                message:
                                    "User is signed out. You need to login to get a new refresh token."
                            })
                            .end();
                    } else {
                        // if everything is good, save to request for use in other routes
                        req.decoded = decoded;
                        console.log("*******", decoded);
                        next();
                    }
                });
            }
        });
    } else {
        // if there is no token
        // return an error
        return res.status(403).send({
            success: false,
            token_invalid: true,
            message: "No token provided."
        });
    }
};

exports.authenticateAccessToken = function(req, res, next) {
    // check header or url parameters or post parameters for token
    var token =
        req.body.token || req.query.token || req.headers["x-access-token"];

    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, app.get("superSecret"), function(err, decoded) {
            if (err) {
                return res.status(401).json({
                    success: false,
                    token_invalid: true,
                    message: "Failed to authenticate token."
                });
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });
    } else {
        // if there is no token
        // return an error
        return res.status(403).send({
            success: false,
            token_invalid: true,
            message: "No token provided."
        });
    }
};
