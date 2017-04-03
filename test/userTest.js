var request = require('supertest');
var expect = require('chai').expect;
var should = require('chai').should();
var mongoose = require('mongoose');
const configDB = require('../config/db');
var user;
var usermodel;

var app = require('express')();

// Data Access Layer
mongoose.connect(configDB.test_url);
mongoose.Promise = require('q').Promise;

// Models
require('../models/user');
require('../models/waypoint');
require('../models/race');

function makeRequest(route, statusCode, done) {
    request(app)
        .get(route)
        .expect(statusCode)
        .end(function (err, res) {
            if (err) {
                return done(err);
            }

            done(null, res);
        });
};

describe('User Unit Test', function () {

    before(function (done) {
        console.log("Initializing user unit tests...");
        usermodel = mongoose.model('User');
        user = require('../routes/api/users');
        app.use('/', user);
        console.log("Done initializing user unit tests.")
        done();
    });

    describe('Testing user route', function () {
        describe('without permission', function () {
            it('should return an error', function (done) {
            });
        });

        describe('with permission', function () {
            describe('without params', function () {
                it('should return a list of users', function (done) { // LIST

                });
            });

            describe('with invalid params', function () {
                it('should return return (invalid PUT or CREATE error)', function (done) {
                    makeRequest("/", 200, function (err, data) {

                    });
                });
            });

            describe('with valid params', function () {
                it('should return the right user', function (done) { // READ
                });
                it('should return the user with updated values', function (done) { // UPDATE
                });
                it('should return the newly created user', function (done) { // CREATE
                });
                it('should return succesfully removed message', function (done) { // DELETE
                });
            });
        });
    });

    after(function (done) {
        usermodel.remove({});
        done();
    });

});
