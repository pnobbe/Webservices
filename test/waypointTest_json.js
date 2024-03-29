var request = require('supertest');
let chai = require('chai');
let chaiHttp = require('chai-http');
var expect = require('chai').expect;
var should = require('chai').should();
var mongoose = require('mongoose');
const configDB = require('../config/db');
var waypoint;
var waypointmodel;


configDB.testing = true;
var app = require('../app');
waypointmodel = mongoose.model('Waypoint');
chai.use(chaiHttp);
// Data Access Layer


// Models
require('../models/user');
require('../models/waypoint');
require('../models/race');

describe('Waypoints', function () {


    beforeEach((done) => { //Before each test we empty the database
        waypointmodel.remove({}, (err) => {
            done();
        })
    });
    describe('JSON', function () {
        describe('/GET waypoint', () => {
            it('it should GET all the waypoints', (done) => {
                chai.request(app)
                    .get('/api/waypoints/all')
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
        describe('/POST waypoint', () => {
            it('it should not POST a waypoint without id', (done) => {
                let waypoint = {
                    name: 'Fitness-centrum Flash Gym',
                };
                chai.request(app)
                    .post('/api/waypoints')
                    .set('content-type', 'application/json')
                    .set('accept', 'application/json')
                    .send(waypoint)
                    .end((err, res) => {
                        res.should.have.status(400);
                        res.body.should.be.a('object');
                        res.body.should.have.property('error');
                        done();
                    });
            }),
                it('it should POST a waypoint ', (done) => {
                    let waypoint = {
                        name: 'Fitness-centrum Flash Gym',
                        id: 'ChIJx9oOP13uxkcRmPYl1Ea20Jk'
                    };
                    chai.request(app)
                        .post('/api/waypoints')
                        .set('content-type', 'application/json')
                        .set('accept', 'application/json')
                        .send(waypoint)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.a('object');
                            res.body.should.have.property('message');
                            res.body.waypoint.should.have.property('id');
                            res.body.waypoint.should.have.property('name');
                            res.body.waypoint.should.have.property('address');
                            res.body.waypoint.should.have.property('lat');
                            res.body.waypoint.should.have.property('lng');
                            done();
                        });
                });
        });
        describe('/GET/:id waypoint', () => {
            it('it should GET a waypoint by the given id', (done) => {
                let waypoint = new waypointmodel({
                    name: 'Fitness-centrum Flash Gym',
                    id: 'ChIJx9oOP13uxkcRmPYl1Ea20Jk'
                });
                waypoint.save((err, user) => {
                    chai.request(app)
                        .get('/api/waypoints/' + waypoint.id)
                        .set('accept', 'application/json')
                        .send(waypoint)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.a('object');
                            res.body.should.have.property('id').eql(waypoint.id);
                            res.body.should.have.property('name').eql(waypoint.name);
                            res.body.should.have.property('address');
                            res.body.should.have.property('lat');
                            res.body.should.have.property('lng');
                            done();
                        });
                });

            }),
                it('it should fail to get a waypoint', (done) => {
                    chai.request(app)
                        .get('/api/waypoints/' + "7")
                        .set('accept', 'application/json')
                        .send(waypoint)
                        .end((err, res) => {
                            res.should.have.status(400);
                            res.body.should.be.a('object');
                            res.body.should.have.property('error').eql("No waypoint found with that id.");
                            done();
                        });


                })
        });
        describe('/PUT/:id waypoint', () => {
            it('it should PUT a waypoint by the given id', (done) => {
                let waypoint = new waypointmodel({
                    name: 'Fitness-centrum Flash Gym',
                    id: 'ChIJx9oOP13uxkcRmPYl1Ea20Jk'
                });
                waypoint.save((err, waypoint) => {
                    waypoint.name = "new Name";
                    chai.request(app)
                        .put('/api/waypoints/' + waypoint.id)
                        .set('accept', 'application/json')
                        .send(waypoint)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.a('object');
                            res.body.should.have.property('id').eql(waypoint.id);
                            res.body.should.have.property('name').eql(waypoint.name);
                            res.body.should.have.property('address');
                            res.body.should.have.property('lat');
                            res.body.should.have.property('lng');
                            done();
                        });
                });

            }),
                it('it should fail to update a waypoint', (done) => {
                    let waypoint = new waypointmodel({
                        name: 'Fitness-centrum Flash Gym',
                        id: 'ChIJx9oOP13uxkcRmPYl1Ea20Jk'
                    });
                    chai.request(app)
                        .put('/api/waypoints/' + waypoint.id)
                        .set('accept', 'application/json')
                        .send(waypoint)
                        .end((err, res) => {
                            res.should.have.status(400);
                            res.body.should.be.a('object');
                            res.body.should.have.property('error');
                            done();
                        });
                })
        });
        describe('/DELETE/:id waypoint', () => {
            it('it should Delete a waypoint by the given id', (done) => {
                let waypoint = new waypointmodel({
                    name: 'Fitness-centrum Flash Gym',
                    id: 'ChIJx9oOP13uxkcRmPYl1Ea20Jk'
                });
                waypoint.save((err, waypoint) => {
                    chai.request(app)
                        .delete('/api/waypoints/' + waypoint.id)
                        .set('accept', 'application/json')
                        .send(waypoint)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.a('object');
                            res.body.should.have.property('message').eql("Deleted succesfully");
                            chai.request(app)
                                .get('/api/waypoints/all')
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
                    it('it should not Delete a waypoint when given an incorrect id', (done) => {
                        let waypoint = new waypointmodel({
                            name: 'Fitness-centrum Flash Gym',
                            id: 'ChIJx9oOP13uxkcRmPYl1Ea20Jk'
                        });
                        waypoint.save((err, waypoint) => {
                            chai.request(app)
                                .delete('/api/waypoints/' + '9')
                                .set('accept', 'application/json')
                                .send(waypoint)
                                .end((err, res) => {
                                    res.should.have.status(200);
                                    res.body.should.be.a('object');
                                    res.body.should.have.property('message').eql("Deleted succesfully");

                                    chai.request(app)
                                        .get('/api/waypoints/all')
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
            waypointmodel.remove({});
            done();
        });

    });
});
