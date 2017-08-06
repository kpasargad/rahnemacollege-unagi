var express = require('express'),
  app = express(),
  port = process.env.PORT || 3000,
  mongoose = require('mongoose'),
  Post = require('./api/models/unagiModel').posts,
  User = require('./api/models/unagiModel').users,
  bodyParser = require('body-parser'),
  morgan = require('morgan'),
  config = require('./config'),
  jwt=require('jsonwebtoken');


mongoose.Promise = global.Promise;
var options = {
  user: 'admin',
  pass: '4KhandRah1'
}


mongoose.connect(config.database);
app.set('superSecret', config.secret);


app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

app.use(morgan('dev'));


// var routes = require('./api/routes/unagiRoutes');
// routes(app);








app.get('/', function (req, res) {
  res.send('Hello! The API is at http://localhost:' + port + '/api');
});







app.get('/setup', function (req, res) {

  // create a sample user
  var kourosh = new User({
    name: 'Kourosh',
    username: 'kpasargad',
    email: 'kpasargad2@gmail.com',
    password: 'password',
    admin: true
  });

  // save the sample user
  kourosh.save(function (err) {
    if (err) throw err;

    console.log('User saved successfully');
    res.json({
      success: true
    });
  });
});








// get an instance of the router for api routes
var apiRoutes = express.Router();








// route to authenticate a user (POST http://localhost:8080/api/authenticate)
apiRoutes.post('/authenticate', function(req, res) {

  // find the user
  User.findOne({
    name: req.body.name
  }, function(err, user) {

    if (err) throw err;

    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {

      // check if password matches
      if (user.password != req.body.password) {
        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
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
apiRoutes.use(function(req, res, next) {

  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {      
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });    
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










// route to show a random message (GET http://localhost:8080/api/)
apiRoutes.get('/', function (req, res) {
  res.json({
    message: 'Welcome to the coolest API on earth!'
  });
});

// route to return all users (GET http://localhost:8080/api/users)
apiRoutes.get('/users', function (req, res) {
  User.find({}, function (err, users) {
    res.json(users);
  });
});

// apply the routes to our application with the prefix /api
app.use('/api', apiRoutes);







app.listen(port);


console.log('unagi server started on: ' + port);