'use strict';

var express = require('express'),
    app=express(),
    apiRoutes = express.Router(),
    User = require('./../models/unagiModel').users,
    jwt = require('jsonwebtoken');



// app.route('/authenticate').post(function (req, res) {

//     // find the user
//     User.findOne({
//         name: req.body.name
//     }, function (err, user) {

//         if (err) throw err;

//         if (!user) {
//             res.json({
//                 success: false,
//                 message: 'Authentication failed. User not found.'
//             });
//         } else if (user) {

//             // check if password matches
//             if (user.password != req.body.password) {
//                 res.json({
//                     success: false,
//                     message: 'Authentication failed. Wrong password.'
//                 });
//             } else {

//                 // if user is found and password is right
//                 // create a token
//                 var token = jwt.sign(user, app.get('superSecret'), {
//                     expiresIn: 1440 // expires in 24 hours
//                 });

//                 // return the information including token as JSON
//                 res.json({
//                     success: true,
//                     message: 'Enjoy your token!',
//                     token: token
//                 });
//             }

//         }

//     });
// });



// apiRoutes.use(function (req, res, next) {

//     // check header or url parameters or post parameters for token
//     var token = req.body.token || req.query.token || req.headers['x-access-token'];

//     // decode token
//     if (token) {

//         // verifies secret and checks exp
//         jwt.verify(token, app.get('superSecret'), function (err, decoded) {
//             if (err) {
//                 return res.json({
//                     success: false,
//                     message: 'Failed to authenticate token.'
//                 });
//             } else {
//                 // if everything is good, save to request for use in other routes
//                 req.decoded = decoded;
//                 next();
//             }
//         });

//     } else {

//         // if there is no token
//         // return an error
//         return res.status(403).send({
//             success: false,
//             message: 'No token provided.'
//         });

//     }
// });

// // route to show a random message (GET http://localhost:8080/api/)


// // route to return all users (GET http://localhost:8080/api/users)


// // apply the routes to our application with the prefix /api
// app.use('/users', apiRoutes);










module.exports = function (app) {
    var unagi = require('../controllers/unagiController');











    // unagi Routes
    app.route('/posts')
        .get(unagi.list_lazy)
        .post(unagi.create_a_post);

    app.route('/posts/:postId')
        .get(unagi.read_a_post)
        .put(unagi.update_a_post)
        .delete(unagi.delete_a_post);

    app.route('/hot')
        .get(unagi.list_hot_posts);

    app.route('/posts/activity')
        .post(unagi.activity);

    app.route('/user').get(function (req, res) {
        var nick = new User({
            name: 'Nick Cerminara',
            email: 'info@nick.io',
            username: 'NickyNick',
            password: 'password'
        });

        // save the sample user
        nick.save(function (err) {
            if (err) throw err;

            console.log('User saved successfully');
            res.json({
                success: true
            });
        });
    })

    app.route('/users').get(function (req, res) {
        User.find({}, function (err, users) {
            res.json(users);
        });
    });
    //TODO: username and password to be received as json









};