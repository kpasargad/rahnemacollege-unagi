'use strict';

const ERR = require('./../consts/errConsts');

var lazyReqValidator = function(req, res, person, callback){
    if (req.query.latitude !== undefined && req.query.longitude !== undefined && req.query.lastpost !== undefined) {
        if (!isNaN(req.query.latitude) && !isNaN(req.query.longitude)) {
            if(/^\d+$/.test(req.query.lastpost)){
                if(req.query.lastpost >= 0){
                    callback(req, res, person);
                }else {
                    res.send({
                        pop_up_error: ERR.LAST_POST_NOT_VALID_ERROR
                    });
                }
            }else {
                res.send({
                    pop_up_error: ERR.LAST_POST_NOT_VALID_ERROR
                });
            }
        }
        else {
            res.send({
                pop_up_error: ERR.LOC_NOT_VALID_ERROR
            })
        }
    } else if (req.query.latitude === undefined || req.query.longitude === undefined) {
        console.log("Someone has requested to see posts but has no location.");
        res.send({
            pop_up_error: ERR.LOC_NOT_FOUND_ERROR
        });
    } else if (req.query.lastpost === undefined) {
        console.log("Someone has requested to see posts but has no lastpost.");
        res.send({
            pop_up_error: ERR.LAST_POST_NOT_FOUND_ERROR
        });
    }
};

exports.lazyReqValidator = lazyReqValidator;