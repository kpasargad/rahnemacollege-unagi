'use strict';

/**
 * Custom error class for handling API-specific errors.
 * Extends the built-in Error class to include an HTTP status code.
 */
class ApiError extends Error {
    /**
     * Creates an instance of ApiError.
     * @param {number} statusCode - The HTTP status code associated with this error.
     * @param {string} message - A human-readable description of the error.
     */
    constructor(statusCode, message) {
        super(message); // Call the parent Error class constructor with the message
        this.statusCode = statusCode; // Custom property for HTTP status code
        this.name = 'ApiError'; // Set the error name to the class name for clarity
        Error.captureStackTrace(this, this.constructor); // Preserve a clean stack trace, excluding the constructor call from it
    }
}

module.exports = ApiError;
