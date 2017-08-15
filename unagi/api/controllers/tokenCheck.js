"use strict";

var mongoose = require("mongoose"),
    UserModel = mongoose.model("Users");

var ERR = require("./consts/errConsts");

/**
 * This function finds the user who is requesting in the database and passes it to other fuunctions
 * @param req
 * @param res
 * @param callback
 */
var fetch_user = function(req, res, callback) {
    console.log("fetching user");
    var decoded = req.decoded;
    UserModel.findOne({ id: decoded.user_id }, function(err, person) {
        if (err) {
            res.send({
                pop_up_error: ERR.USER_ERROR
            });
        } else if (person === null) {
            console.log("USER NOT FOUND IN FETCH USER SOMETHING IS WRONG");
            res.send({
                pop_up_error: "USER NOT FOUND IN FETCH USER SOMETHING IS WRONG"
            });
        } else {
            console.log("found person " + person);
            callback(req, res, person);
        }
    });
};
module.exports.fetch_user = fetch_user;
