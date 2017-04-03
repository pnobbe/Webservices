const q = require('q');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Waypoint = mongoose.model('Waypoint');
const Race = mongoose.model('Race');

const user1 = new User();
user1.name = "Marius de Vogel";
user1.email = "mariusdv@outlook.com";
user1.password = "NOPLAINTEXT!";


const waypoint1 = new Waypoint();
waypoint1.id = "w1";
waypoint1.name = "plekje1";
waypoint1.address = "street 123";

const waypoint2 = new Waypoint();
waypoint2.id = "w2";
waypoint2.name = "plekje2";
waypoint2.address = "street 1234";

const race1 = new Race();

race1.name = "TESTRACE";
race1.owner = user1;
race1.participants = [user1];
race1.waypoints = [
    {
        waypoint: waypoint1,
        passed_participants: [{
            user: user1, time: new Date()
        }]
    },
    {
        waypoint: waypoint2
    }];


function fillTestUsers() {

    const testData = [
        user1
    ];
    fill(User, testData, "user");
}

function fillTestWaypoints() {
    const testData = [
            waypoint1, waypoint2
        ]
        ;
    fill(Waypoint, testData, "waypoint");
}

function fillTestRaces() {
    const testData = [
        race1
    ];
    fill(Race, testData, "race");
}


function fill(monObject, testData, name) {


    monObject.find({}).then(function (data) {
        if (data.length == 0) {
            console.log('Creating ' + name + ' testdata');

            testData.forEach(function (user) {
                user.save();
            });
        }
        else {
            console.log('Skipped creating ' + name + ' testdata, data is already present');
        }
    })
    ;
};


module.exports = function () {
    q.fcall(fillTestRaces).then(fillTestWaypoints).then(fillTestUsers);
}