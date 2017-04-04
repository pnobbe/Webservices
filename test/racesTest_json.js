var request = require('supertest');
let chai = require('chai');
let chaiHttp = require('chai-http');
var expect = require('chai').expect;
var should = require('chai').should();
var mongoose = require('mongoose');
const configDB = require('../config/db');
var race;
var racemodel;
var usermodel;
var savedUser;

configDB.testing = true;
var app = require('../app');
racemodel = mongoose.model('Race');
usermodel = mongoose.model('User');
chai.use(chaiHttp);
// Data Access Layer


// Models
require('../models/race');
require('../models/waypoint');
require('../models/race');

describe('Race', function () {


    // create a user
    before(done => {
        let user = new usermodel({
            email: "Rickyrick@wabbalabbadubdub.com",
            password: "C-137",
            name: "Rick"
        });
        user.save((err, user) => {
            savedUser = user;
            done();

        })
    });

    beforeEach((done) => { //Before each test we empty the database
        racemodel.remove({}, (err) => {
            done();
        })
    });
    describe('JSON', function () {
        describe('/GET race', () => {
            it('it should GET all the races', (done) => {
                chai.request(app)
                    .get('/api/races/all')
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
        describe('/POST race', () => {
            it('it should not POST a race without name', (done) => {
                let race = new racemodel({
                    city: "Den Bosch",
                    owner: savedUser,
                    creationDate: Date.now()
                });
                chai.request(app)
                    .post('/api/races')
                    .set('content-type', 'application/json')
                    .set('accept', 'application/json')
                    .send(race)
                    .end((err, res) => {
                        res.should.have.status(400);
                        res.body.should.be.a('object');
                        res.body.should.have.property('error');
                        done();
                    });
            }),
                it('it should POST a race ', (done) => {
                    let race = new racemodel({
                        name: "De Race",
                        city: "Den Bosch",
                        owner: savedUser,
                        creationDate: Date.now()
                    });
                    chai.request(app)
                        .post('/api/races')
                        .set('content-type', 'application/json')
                        .set('accept', 'application/json')
                        .send(race)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.a('object');
                            res.body.should.have.property('message').eql('Race has been created successfully.');
                            res.body.race.should.have.property('name').eql(race.name);
                            res.body.race.should.have.property('city').eql(race.city);
                            chai.assert(res.body.race.owner.toString() == savedUser._id.toString());
                            done();
                        });
                });
        });
        describe('/GET/:name race', () => {
            it('it should GET a race by the given name', (done) => {
                let race = new racemodel({
                    name: "De Race",
                    city: "Den Bosch",
                    owner: savedUser,
                    creationDate: Date.now()
                });
                race.save((err, race) => {
                    chai.request(app)
                        .get('/api/races/' + race.name)
                        .set('accept', 'application/json')
                        .send(race)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.a('object');
                            res.body.should.have.property('name').eql(race.name);
                            res.body.should.have.property('city').eql(race.city);
                            chai.assert(res.body.owner.email.toString() == savedUser.email.toString());
                            done();
                        });
                });

            }),
                it('it should fail to get a race', (done) => {
                    chai.request(app)
                        .get('/api/races/' + "Rickyrick")
                        .set('accept', 'application/json')
                        .send(race)
                        .end((err, res) => {
                            res.should.have.status(400);
                            res.body.should.be.a('object');
                            res.body.should.have.property('error').eql("No race found with that name.");
                            done();
                        });


                })
        });
        describe('/PUT/:name race', () => {
            it('it should PUT a race by the given name', (done) => {
                let race = new racemodel({
                    name: "De Race",
                    city: "Den Bosch",
                    owner: savedUser,
                    creationDate: Date.now()
                });
                race.save((err, race) => {
                    var e = race.name;
                    race.name = "TweedeRace";
                    chai.request(app)
                        .put('/api/races/' + e)
                        .set('accept', 'application/json')
                        .send(race)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.a('object');
                            res.body.should.have.property('name').eql(race.name);
                            res.body.should.have.property('city').eql(race.city);
                            chai.assert(res.body.owner.toString() == savedUser._id.toString());
                            done();
                        });
                });

            }),
                it('it should fail to update a race', (done) => {
                    let race = new racemodel({
                        name: "De Race",
                        city: "Den Bosch",
                        owner: savedUser,
                        creationDate: Date.now()
                    });
                    var e = race.name;
                    race.name = "TweedeRace";
                    chai.request(app)
                        .put('/api/races/' + e)
                        .set('accept', 'application/json')
                        .send(race)
                        .end((err, res) => {
                            res.should.have.status(400);
                            res.body.should.be.a('object');
                            res.body.should.have.property('error');
                            done();
                        });
                })
        });
        describe('/DELETE/:name race', () => {
            it('it should Delete a race by the given name', (done) => {
                let race = new racemodel({
                    name: "De Race",
                    city: "Den Bosch",
                    owner: savedUser,
                    creationDate: Date.now()
                });
                race.save((err, race) => {
                    chai.request(app)
                        .delete('/api/races/' + race.name)
                        .set('accept', 'application/json')
                        .send(race)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.a('object');
                            res.body.should.have.property('message').eql("Deleted succesfully");
                            chai.request(app)
                                .get('/api/races/all')
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
                    it('it should not Delete a race when given an incorrect name', (done) => {
                        let race = new racemodel({
                            name: "De Race",
                            city: "Den Bosch",
                            owner: savedUser
                        });
                        race.save((err, race) => {
                            chai.request(app)
                                .delete('/api/races/' + 'Ricky')
                                .set('accept', 'application/json')
                                .send(race)
                                .end((err, res) => {
                                    res.should.have.status(200);
                                    res.body.should.be.a('object');
                                    res.body.should.have.property('message').eql("Deleted succesfully");

                                    chai.request(app)
                                        .get('/api/races/all')
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
            racemodel.remove({});
            done();
        });

    });
});
