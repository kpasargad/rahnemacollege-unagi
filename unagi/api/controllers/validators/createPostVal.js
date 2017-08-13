const CHARACTERS_BOUND = require('./../consts/appConsts').CHARACTERS_BOUND;

var mongoose = require('mongoose'),
    Post = mongoose.model('Posts'),
    Actions = mongoose.model('Actions');

var ERR = require('./../consts/errConsts');

exports.createPostVal = function (req, res, person, callback) {
    if (req.body.Longitude === undefined || req.body.Latitude === undefined) {
        console.log(ERR.LOC_NOT_FOUND_ERROR);
        res.send({
            pop_up_error: ERR.LOC_NOT_FOUND_ERROR
        });
    } else if (isNaN(req.body.Longitude) || isNaN(req.body.Latitude)) {
        console.log(ERR.LOC_NOT_VALID_ERROR);
        res.send({
            pop_up_error: ERR.LOC_NOT_VALID_ERROR
        });
    } else if (req.body.text === undefined) {
        console.log(ERR.TEXT_ERROR);
        res.send({
            pop_up_error: ERR.TEXT_ERROR
        });
    } else if (req.body.text.length > CHARACTERS_BOUND) {
        console.log(ERR.NUMBER_OF_CHARACTERS_ERROR);
        res.send({
            pop_up_error: ERR.NUMBER_OF_CHARACTERS_ERROR
        });
    } else {
        if (req.body.parent_id === undefined) {
            callback(req, res, person, undefined);
        } else {
            Post.findOne({
                id: req.body.parent_id
            }, function (err, parent) {
                if (err) {
                    res.send({
                        pop_up_error: ERR.POST_PARENT_ERROR
                    })
                } else if (parent === null) {
                    res.send({
                        pop_up_error: ERR.POST_PARENT_NOT_EXISTING_ERROR
                    })
                } else {
                    callback(req, res, person, parent)
                }
            })
        }
    }
};