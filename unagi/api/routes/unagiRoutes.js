'use strict';

var express = require('express'),
    app = express(),
    router = express.Router(),
    User = require('./../models/unagiModel').users,
    config = require('./../../config'),
    unagi = require('./../controllers/unagiController'),
    jwt = require('jsonwebtoken');

app.set('superSecret', config.secret);


router.get('/', function (req, res) {
    res.send("Welcome to root");
});

router.post('/signup', function (req, res) {

    //TODO: Consider Validations

    // create a sample user
    var newUser = new User({
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        // UUID: req.body.IMEI
    });

    // save the sample user
    newUser.save(function (err) {
        if (err) throw err;

        console.log('User saved successfully');
        res.json({
            success: true
        });
    });
});


// route to authenticate a user (POST http://localhost:8080/api/authenticate)
router.post('/signin', function (req, res) {

    // find the user
    User.findOne({
        username: req.body.username
    }, function (err, user) {

        if (err) throw err;

        if (!user) {
            res.json({
                success: false,
                message: 'Authentication failed. User not found.'
            });
        } else if (user) {

            // check if password matches
            if (user.password != req.body.password) {
                res.json({
                    success: false,
                    message: 'Authentication failed. Wrong password.'
                });
            } else {

                // if user is found and password is right
                // create a token
                var payload = {
                    'id': user.id
                }
                var token = jwt.sign(payload, app.get('superSecret'), {
                    expiresIn: 1440 // expires in 24 hours
                });

                // return the information including token as JSON
                res.json({
                    success: true,
                    message: 'Enjoy your token!',
                    token: token
                });
            }
        }
    });
});


// route middleware to verify a token
router.use('/api', function (req, res, next) {

    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    // decode token
    if (token) {

        // verifies secret and checks exp
        jwt.verify(token, app.get('superSecret'), function (err, decoded) {
            if (err) {
                return res.json({
                    success: false,
                    message: 'Failed to authenticate token.'
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
            message: 'No token provided.'
        });
    }
});


router.get('/api/users', function (req, res) {
    User.find({}, function (err, users) {
        console.log(users);
        res.json(users);
    });
});

router.get('/api/posts', unagi.list_lazy);

router.post('/api/posts', unagi.create_a_post);

router.get('/api/posts/:postId', unagi.read_a_post);

router.get('/api/hot', unagi.list_hot_posts);

router.post('/api/posts/activity', unagi.activity);

module.exports.router = router;