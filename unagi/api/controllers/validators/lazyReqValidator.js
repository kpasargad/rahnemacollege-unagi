'use strict';

const LAST_POST_NOT_FOUND_ERROR = "You have not sent the last post";
const LAST_POST_NOT_VALID_ERROR = "Lastpost is not an integer.";
const LOC_NOT_FOUND_ERROR = "No location has been sent.";
const LOC_NOT_VALID_ERROR = "Location is sent but is not valid";

var lazyReqValidator = function(req, res, person, callback){
    if (req.query.latitude !== undefined && req.query.longitude !== undefined && req.query.lastpost !== undefined) {
        if (!isNaN(req.query.latitude) && !isNaN(req.query.longitude)) {
            if(/^\d+$/.test(req.query.lastpost)){
                if(req.query.lastpost >= 0){
                    callback(req, res, person);
                }else {
                    res.send({
                        pop_up_error: LAST_POST_NOT_VALID_ERROR
                    });
                }
            }else {
                res.send({
                    pop_up_error: LAST_POST_NOT_VALID_ERROR
                });
            }
        }
        else {
            res.send({
                pop_up_error: LOC_NOT_VALID_ERROR
            })
        }
    } else if (req.query.latitude === undefined || req.query.longitude === undefined) {
        console.log("Someone has requested to see posts but has no location.");
        res.send({
            pop_up_error: LOC_NOT_FOUND_ERROR
        });
    } else if (req.query.lastpost === undefined) {
        console.log("Someone has requested to see posts but has no lastpost.");
        res.send({
            pop_up_error: LAST_POST_NOT_FOUND_ERROR
        });
    }
};

exports.lazyReqValidator = lazyReqValidator;