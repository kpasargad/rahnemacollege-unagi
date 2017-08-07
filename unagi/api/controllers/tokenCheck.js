'use strict';

var mongoose = require('mongoose'),
    UserModel = mongoose.model('Users');

var tokenConst = require('./consts/tokenConst');

var ERR = require('./consts/errConsts');

var create_a_user = function (req, res, callback) {
    UserModel.findOne().sort({id: -1}).exec(function (err, person) {
        if (err) {
            res.send(err);
            return undefined;
        }
        else {
            var id = 1;
            if (person === null) {
                //do nothing
            } else {
                id = person.id + 1;
            }
            var new_user = new UserModel({
                token: req.query.token,
                id: id
            });
            new_user.save(function (err, user) {
                if (err) {
                    callback(undefined);
                } else {
                    callback(new_user);
                }
            });
        }
    });
};

/*returns a new user or the associated existing user.
* returns undefined in case of error
* */
var old_check_token = function (req, res, callback) {
    console.log("CHECKING TOKEN");
    console.log(req.query.token);
    if (req.query.token !== undefined) {
        if (req.query.token.length === tokenConst.tokenSize || !tokenConst.applyTokenSize)
            UserModel.findOne({'token': req.query.token}, function (err, person) {
                if (err) {
                    res.send(err);
                    callback(undefined);
                }
                if (person === null) {
                    console.log("creating new user");
                    create_a_user(req, res, callback);
                } else {
                    console.log(person);
                    console.log("submitted user");
                    callback(person);
                }
            });
        else {
            res.send({
                pop_up_error: ERR.INVALID_TOKEN_ERROR
            });
        }
    } else {
        res.send({
            pop_up_error: ERR.TOKEN_NOT_SENT_ERROR
        });
    }
};

var check_token = function (req, res, callback) {
    console.log("fetching user");
    var decoded = req.decoded;
    UserModel.findOne({id: decoded.id}, function (err, person) {
        if (err) {
            res.send({
                pop_up_error: ERR.USER_ERROR
            })
        }
        else {
            console.log("found person " + person);
            callback(person);
        }
    });
};
module.exports.check_token = check_token;