var express = require("express"),
    app = express(),
    router = express.Router(),
    User = require("./../models/unagiModel").users,
    Auth = require("./../models/unagiModel").auths,
    config = require("./../../config"),
    unagi = require("./../controllers/unagiController"),
    auth = require("./../controllers/authController"),
    jwt = require("jsonwebtoken");

app.set("superSecret", config.secret);
var mongoose = require('mongoose'),
    Info = mongoose.model('Info');

var add_user_to_database = function (req, res, id) {
    var newUser = new User({
        id: id,
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
        // UUID: req.body.IMEI
    });

    // save the sample user
    newUser.save(function (err) {
        if (err) throw err;

        console.log("User saved successfully");
        res.json({
            success: true
        });
    });
};

exports.singup = function (req, res) {
    Info.findOne({},
        function (err, info) {
            if (err) {
                res.send(err);
            } else if (info === null) {
                Info.findOneAndUpdate({},
                    {$set: {number_of_post_requests: 1000, number_of_user_requests: 1000}},
                    {upsert: true, new: true},
                    function (err, info) {
                        if (err) {
                            res.send(err);
                        } else {
                            let id = info.number_of_user_requests;
                            add_user_to_database(req, res, id);
                        }
                    }
                );
            } else {
                Info.findOneAndUpdate({},
                    {$inc: {number_of_user_requests: 1}},
                    {upsert: true, new: true},
                    function (err, info) {
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

exports.signin = function (req, res, next) {
    // find the user
    User.findOne(
        {
            username: req.body.username
        },
        function (err, user) {
            if (err) throw err;

            if (!user) {
                res.json({
                    success: false,
                    message: "Authentication failed. User not found."
                });
            } else if (user) {
                // check if password matches
                if (user.password != req.body.password) {
                    res.json({
                        success: false,
                        message: "Authentication failed. Wrong password."
                    });
                } else {
                    // if user is found and password is right
                    // create a token
                    var payload = {
                        id: user.id
                    };
                    var token = jwt.sign(payload, app.get("superSecret"), {
                        expiresIn: 60 * 60 * 24 // expires in 24 hours
                    });

                    // return the information including token as JSON
                    console.log(user, token);
                    res.json({
                        success: true,
                        message: "Enjoy your token!",
                        token: token
                    });
                    req.body.user_id = user.id;
                    next();
                }
            }
        }
    );
};

exports.serializeClient = function (req, res, next) {
    Auth.findOneAndUpdate(
        {user_id: req.body.user_id},
        {imei: req.body.imei, lastLoginDate: Date.now()},
        {upsert: true},
        function (err, client) {
            if (err) throw err;
            if (!client) {
                client = new Auth();
            }
            client.save(function (error) {
                if (err) throw err;
                else {
                    console.log(client);
                }
            });
        }
    );
};

exports.authenticate = function (req, res, next) {
    // check header or url parameters or post parameters for token
    var token =
        req.body.token || req.query.token || req.headers["x-access-token"];

    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, app.get("superSecret"), function (err, decoded) {
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
