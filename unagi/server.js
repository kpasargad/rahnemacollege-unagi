'use strict';

const helmet = require('helmet'); // Added helmet
var express = require("express"),
    app = express(),
    port = process.env.PORT || 3000,
    mongoose = require("mongoose"),
    Post = require("./api/models/unagiModel").posts,
    User = require("./api/models/unagiModel").users,
    bodyParser = require("body-parser"),
    morgan = require("morgan"),
    config = require("./config"),
    jwt = require("jsonwebtoken");

mongoose.Promise = global.Promise;

var options = {
    user: "admin",
    pass: "4KhandRah1"
};

mongoose.connect(config.database);
app.set("superSecret", config.secret);

app.use(helmet()); // Used helmet

app.use(
    bodyParser.urlencoded({
        extended: false
    })
);
app.use(bodyParser.json());

app.use(morgan("dev"));

var router = express.Router();
var routes = require("./api/routes/unagiRoutes").router;

app.use("/", routes);

// Global Error Handling Middleware.
// This middleware must be the last one added to the app stack.
// It catches errors passed by `next(err)` from any prior middleware or route handlers.
app.use((err, req, res, next) => {
    // Log the full error stack for server-side debugging.
    // Uses err.stack for detailed info, falls back to err.message or the error object itself.
    console.error('[GlobalErrorHandler]', err.stack || err.message || err);

    // Check if headers have already been sent to the client.
    // If so, it's too late to send a new response, so delegate to the default Express error handler
    // which will close the connection and possibly terminate the process.
    if (res.headersSent) {
        return next(err); 
    }

    // Determine the status code for the response.
    // Prioritize err.status or err.statusCode (from ApiError or other error types),
    // otherwise default to 500 (Internal Server Error).
    const statusCode = err.status || err.statusCode || 500;
    
    // Determine the message for the response.
    // If it's a client-side error (statusCode < 500) and the error has a message, use it.
    // Otherwise, for server-side errors or errors without a specific message, use a generic message.
    const message = err.message && statusCode < 500 ? err.message : 'Internal Server Error';

    // Send a standardized JSON error response.
    res.status(statusCode).json({
        success: false,
        message: message
    });
});

app.listen(port);

console.log("unagi server started on: " + port);

module.exports = app; // Export the app for testing
