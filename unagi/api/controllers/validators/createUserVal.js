'use strict';
var emailVal = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
var ERR = require('./../consts/signUpErrConsts');
var mongoose = require('mongoose'),
    Users = mongoose.model('Users');

exports.user_sign_up_val = function (req, res, callback) {
    let name = req.body.name,
        username = req.body.username,
        email = req.body.email,
        password = req.body.password;
    if(name === undefined){
        res.send({
            success : false,
            pop_up_error : ERR.NO_NAME
        })
    }else if(username === undefined){
        res.send({
            success : false,
            pop_up_error: ERR.NO_USERNAME
        })
    }else if(email === undefined){
        res.send({
            success : false,
            pop_up_error: ERR.NO_EMAIL
        })
    } else if(password === undefined){
        res.send({
            success : false,
            pop_up_error : ERR.NO_PASSWORD
        })
    } else{
        if(typeof name !== 'string'){
            res.send({
                success : false,
                pop_up_error : ERR.INVALID_NAME
            })
        }else if(typeof password !== 'string'){
            res.send({
                success : false,
                pop_up_error : ERR.INVALID_PASSWORD
            })
        }else if(typeof email === 'string'){
            if(!emailVal.test(email)){
                res.send({success : false,
                    pop_up_error :ERR.INVALID_EMAIL
                })
            }else {
                if(typeof username === 'string'){
                    Users.findOne({
                        username : username
                    },function (err, user) {
                        if(err){
                            res.send(err)
                        }
                        if(user !== null){
                            res.send({
                                success : false,
                                pop_up_error: ERR.DUPLICATE_USERNAME
                            })
                        }else {
                            callback(req, res);
                        }
                    })
                }else {
                    res.send({
                        success : false,
                        pop_up_error : ERR.INVALID_USERNAME
                    })
                }
            }
        }else {
            res.send({
                success : false,
                pop_up_error :ERR.INVALID_EMAIL
            })
        }
    }
};