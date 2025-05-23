"use strict";

var express = require("express"),
    app = express(),
    router = express.Router(),
    User = require("./../../models/unagiModel").users,
    Auth = require("./../../models/unagiModel").auths,
    config = require("./../../../config"),
    jwt = require("jsonwebtoken"),
    hash = require("../../utils/hash");

app.set("superSecret", config.secret);
var mongoose = require("mongoose"),
    Info = mongoose.model("Info");

/**
 * This function is used to add users to the database
 * @param req
 * @param res
 * @param id
 */

async function add_user_to_database(req, res, id, plainPassword) {
    try {
        const hashedPassword = await hash.hashPassword(plainPassword);
        var newUser = new User({
            id: id,
            name: req.body.name,
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        });
        await newUser.save();
        console.log("User saved successfully");
        if (!res.headersSent) {
            res.json({ success: true });
        }
    } catch (err) {
        console.error("Error saving user:", err);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: "Error saving user." });
        }
    }
}

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
                async function(err, info) { // Made async
                    if (err) {
                        return res.send(err); // Added return
                    }
                    try {
                        let id = info.number_of_user_requests;
                        await add_user_to_database(req, res, id, req.body.password);
                    } catch (error) {
                        console.error("Signup error during user creation (info was null):", error);
                        if (!res.headersSent) {
                            res.status(500).json({ success: false, message: "Error during signup process." });
                        }
                    }
                }
            );
        } else {
            Info.findOneAndUpdate(
                {},
                { $inc: { number_of_user_requests: 1 } },
                { upsert: true, new: true },
                async function(err, info) { // Made async
                    if (err) {
                        return res.send(err); // Added return
                    }
                    try {
                        let id = info.number_of_user_requests;
                        await add_user_to_database(req, res, id, req.body.password);
                    } catch (error) {
                        console.error("Signup error during user creation:", error);
                        if (!res.headersSent) {
                            res.status(500).json({ success: false, message: "Error during signup process." });
                        }
                    }
                }
            );
        }
    });
};
