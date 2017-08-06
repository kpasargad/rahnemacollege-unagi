'use strict';

var express = require('express'),
    app = express(),
    apiRoutes = express.Router(),
    User = require('./../models/unagiModel').users,
    jwt = require('jsonwebtoken');



app.post('/signup', function (req, res) {

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
apiRoutes.post('/signin', function (req, res) {

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
                var token = jwt.sign(user, app.get('superSecret'), {
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
apiRoutes.use(function (req, res, next) {

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







// route to return all users (GET http://localhost:8080/api/users)
apiRoutes.get('/users', function (req, res) {
  User.find({}, function (err, users) {
    res.json(users);
  });
});


// apply the routes to our application with the prefix /api
app.use('/api', apiRoutes);




module.exports = function (app) {
    var unagi = require('../controllers/unagiController');

    // unagi Routes
    app.route('/api/posts')
        .get(unagi.list_lazy)
        .post(unagi.create_a_post);

    app.route('/api/posts/:postId')
        .get(unagi.read_a_post)
        .put(unagi.update_a_post)
        .delete(unagi.delete_a_post);

    app.route('/api/hot')
        .get(unagi.list_hot_posts);

    app.route('/api/posts/activity')
        .post(unagi.activity);

};