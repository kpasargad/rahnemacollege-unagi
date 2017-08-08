'use strict';

const ERR = require('./../consts/errConsts');

var lazyReqValidator = function(req, res, person, callback){
    let latitude = req.query.latitude;
    let longitude = req.query.longitude;
    console.log("latitude" + latitude);
    console.log("longitude" + longitude);

    if (latitude !== undefined && longitude !== undefined && req.query.lastpost !== undefined) {
        if (!isNaN(latitude) && !isNaN(longitude)) {
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