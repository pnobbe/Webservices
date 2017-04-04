var request = require('supertest');
let chai = require('chai');
let chaiHttp = require('chai-http');
var expect = require('chai').expect;
var should = require('chai').should();
var mongoose = require('mongoose');
const configDB = require('../config/db');
var user;
var usermodel;


configDB.testing = true;
var app = require('../app');
usermodel = mongoose.model('User');
chai.use(chaiHttp);
// Data Access Layer


// Models
require('../models/user');
require('../models/waypoint');
require('../models/race');

describe('User', function () {


    beforeEach((done) => { //Before each test we empty the database
        usermodel.remove({}, (err) => {
            done();
        })
    });
    describe('JSON', function () {
        describe('/GET user', () => {
            it('it should GET all the users', (done) => {
                chai.request(app)
                    .get('/api/users/all')
                    .set('content-type', 'application/json')
                    .set('accept', 'application/json')
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.result.should.be.a('array');
                        res.body.result.length.should.be.eql(0);
                        done();
                    });
            });
        });
        describe('/POST user', () => {
            it('it should not POST a user without email', (done) => {
                let user = {
                    name: "Rick Sanchez",
                    password: "123"
                };
                chai.request(app)
                    .post('/api/users')
                    .set('content-type', 'application/json')
                    .set('accept', 'application/json')
                    .send(user)
                    .end((err, res) => {
                        res.should.have.status(400);
                        res.body.should.be.a('object');
                        res.body.should.have.property('error');
                        done();
                    });
            }),
                it('it should POST a user ', (done) => {
                    let user = {
                        name: "Rick Sanchez",
                        password: "123",
                        email: "Rickyrick@wabbalabbadubdub.com"
                    }
                    chai.request(app)
                        .post('/api/users')
                        .set('content-type', 'application/json')
                        .set('accept', 'application/json')
                        .send(user)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.a('object');
                            res.body.should.have.property('message').eql('User has been created successfully.');
                            res.body.user.should.have.property('name');
                            res.body.user.should.have.property('email');
                            done();
                        });
                });
        });
        describe('/GET/:email user', () => {
            it('it should GET a user by the given email', (done) => {
                let user = new usermodel({email: "Rickyrick@wabbalabbadubdub.com", password: "C-137", name: "Rick"});
                user.save((err, user) => {
                    chai.request(app)
                        .get('/api/users/' + user.email)
                        .set('accept', 'application/json')
                        .send(user)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.a('object');
                            res.body.should.have.property('email').eql(user.email);
                            res.body.should.have.property('name');
                            done();
                        });
                });

            }),
                it('it should fail to get a user', (done) => {
                    chai.request(app)
                        .get('/api/users/' + "Rickyrick@wabbalabbadubdub.com")
                        .set('accept', 'application/json')
                        .send(user)
                        .end((err, res) => {
                            res.should.have.status(400);
                            res.body.should.be.a('object');
                            res.body.should.have.property('error').eql("No user found with that email.");
                            done();
                        });


                })
        });
        describe('/PUT/:email user', () => {
            it('it should PUT a user by the given email', (done) => {
                let user = new usermodel({
                    email: "Rickyrick@wabbalabbadubdub.com",
                    password: "C-137",
                    name: "Rick"
                });
                user.save((err, user) => {
                    var e = user.email;
                    user.email = "Morty@Scared.com";
                    chai.request(app)
                        .put('/api/users/' + e)
                        .set('accept', 'application/json')
                        .send(user)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.a('object');
                            res.body.should.have.property('email').eql(user.email);
                            res.body.should.have.property('name').eql(user.name);
                            done();
                        });
                });

            }),
                it('it should fail to update a user', (done) => {
                    let user = new usermodel({
                        email: "Rickyrick@wabbalabbadubdub.com",
                        password: "C-137",
                        name: "Rick"
                    });
                    var e = user.email;
                    user.email = "Morty@Scared.com";
                    chai.request(app)
                        .put('/api/users/' + e)
                        .set('accept', 'application/json')
                        .send(user)
                        .end((err, res) => {
                            res.should.have.status(400);
                            res.body.should.be.a('object');
                            res.body.should.have.property('error');
                            done();
                        });
                })
        });
        describe('/DELETE/:email user', () => {
            it('it should Delete a user by the given email', (done) => {
                let user = new usermodel({email: "Rickyrick@wabbalabbadubdub.com", password: "C-137", name: "Rick"});
                user.save((err, user) => {
                    chai.request(app)
                        .delete('/api/users/' + user.email)
                        .set('accept', 'application/json')
                        .send(user)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.a('object');
                            res.body.should.have.property('message').eql("Deleted succesfully");
                            chai.request(app)
                                .get('/api/users/all')
                                .set('content-type', 'application/json')
                                .set('accept', 'application/json')
                                .end((err, res) => {
                                    res.should.have.status(200);
                                    res.body.result.should.be.a('array');
                                    res.body.result.length.should.be.eql(0);
                                    done();
                                });
                        });


                }),
                    it('it should not Delete a user when given an incorrect email', (done) => {
                        let user = new usermodel({
                            email: "Rickyrick@wabbalabbadubdub.com",
                            password: "C-137",
                            name: "Rick"
                        });
                        user.save((err, user) => {
                            chai.request(app)
                                .delete('/api/users/' + 'Ricky')
                                .set('accept', 'application/json')
                                .send(user)
                                .end((err, res) => {
                                    res.should.have.status(200);
                                    res.body.should.be.a('object');
                                    res.body.should.have.property('message').eql("Deleted succesfully");

                                    chai.request(app)
                                        .get('/api/users/all')
                                        .set('content-type', 'application/json')
                                        .set('accept', 'application/json')
                                        .end((err, res) => {
                                            res.should.have.status(200);
                                            res.body.result.should.be.a('array');
                                            res.body.result.length.should.be.eql(1);
                                            done();
                                        });

                                });

                        })
                    });

            });
        });
        after(function (done) {
            usermodel.remove({});
            done();
        });

    });
});
