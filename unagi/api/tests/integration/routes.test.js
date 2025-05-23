'use strict';
const request = require('supertest');
const app = require('../../../server'); // Assuming server.js exports the app

describe('GET /', () => {
    it('should respond with welcome message', (done) => {
        request(app)
            .get('/')
            .expect(200)
            .expect('Content-Type', /text\/html/) // Or application/json if it changes
            .expect(/"Welcome to root"/) // Check for the welcome message
            .end((err, res) => {
                if (err) return done(err);
                return done();
            });
    });
});
