'use strict';
const ApiError = require('../../utils/ApiError'); // Adjust path as needed
const { expect } = require('chai');

describe('ApiError', () => {
    it('should create an error with correct statusCode, message, and name', () => {
        const error = new ApiError(404, 'Not Found');
        expect(error).to.be.instanceOf(Error);
        expect(error.statusCode).to.equal(404);
        expect(error.message).to.equal('Not Found');
        expect(error.name).to.equal('ApiError');
    });

    it('should have a stack trace', () => {
        const error = new ApiError(500, 'Server Error');
        expect(error.stack).to.be.a('string');
    });
});
