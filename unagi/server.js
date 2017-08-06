var express = require('express'),
  app = express(),
  port = process.env.PORT || 3000,
  mongoose = require('mongoose'),
  Post = require('./api/models/unagiModel').posts,
  User = require('./api/models/unagiModel').users,
  bodyParser = require('body-parser'),
  morgan = require('morgan'),
  config = require('./config');


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

// TODO: route to authenticate a user (POST http://localhost:8080/api/authenticate)

// TODO: route middleware to verify a token

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