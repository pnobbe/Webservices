var request = require('supertest');
let chai = require('chai');
let chaiHttp = require('chai-http');
var expect = require('chai').expect;
var should = require('chai').should();
var mongoose = require('mongoose');
const configDB = require('../config/db');
var waypointmodel;


configDB.testing = true;
var app = require('../app');
waypointmodel = mongoose.model('Waypoint');
chai.use(chaiHttp);
// Data Access Layer

var place = new (require("../service/places"))();

describe('Places', function () {

    describe('getNearbybyCity', () => {
        it("should return den bosch cafe's", (done) => {
            place.getNearbybyCity("den bosch", "cafe").then(data => {
                chai.assert(Array.isArray(data), "Not an array");
                chai.assert(data.length > 0, "No data");
                chai.assert(data[0].waypoint instanceof waypointmodel, "Not an waypointModel");
                done();
            });
        }).timeout(5000);
    });
    describe('getNearbyLocationsbyCity', () => {
        it("should return den bosch locations", (done) => {
            place.getNearbyLocationsbyCity("den bosch").then(data => {
                chai.assert(Array.isArray(data), "Not an array");
                chai.assert(data.length > 0, "No data");
                chai.assert(data[0].waypoint instanceof waypointmodel, "Not an waypointModel");
                done();
            });
        }).timeout(5000);
    });
});


function checkPromiseResponse(promise) {
    return promise.then((res) => {
        expect(res)
            .to.be.an.instanceof(Object);
        expect(res.body)
            .to.be.an.instanceof(Object);
        expect(res.body.status)
            .to.equal(statusString);
        expect(res.statusCode)
            .to.equal(200);
    });
}
