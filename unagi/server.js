var express = require('express'),
  app = express(),
  port = process.env.PORT || 3000,
  mongoose = require('mongoose'),
  Post = require('./api/models/unagiModel').posts,
  User = require('./api/models/unagiModel').users,
  bodyParser = require('body-parser'),
  morgan = require('morgan'),
  config = require('./config'),
  jwt = require('jsonwebtoken');


mongoose.Promise = global.Promise;

var options = {
  user: 'admin',
  pass: '4KhandRah1'
};

mongoose.connect(config.database);
app.set('superSecret', config.secret);


app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

app.use(morgan('dev'));

var router=express.Router();
var routes = require('./api/routes/unagiRoutes').router;

app.use('/', routes); 



app.listen(port);


console.log('unagi server started on: ' + port);