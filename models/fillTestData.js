var q = require('q');

var mongoose = require('mongoose');

var User = mongoose.model('User');
var Waypoint = mongoose.model('Waypoint');
var Race = mongoose.model('Race');

var user1 = new User();
user1.name = "Marius de Vogel";
user1.email = "mariusdv@outlook.com";
user1.password = "NOPLAINTEXT!";


var waypoint1 = new Waypoint();
waypoint1.id = "w1";
waypoint1.name = "plekje1";

var waypoint2 = new Waypoint();
waypoint2.id = "w2";
waypoint2.name = "plekje2";

var race1 = new Race();

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

    var testData = [
        user1
    ];
    fill(User, testData, "user");
}

function fillTestWaypoints() {
    var testData = [
            waypoint1, waypoint2
        ]
        ;
    fill(Waypoint, testData, "waypoint");
}

function fillTestRaces() {
    var testData = [
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
    q.fcall(fillTestUsers).then(fillTestWaypoints);
    q.fcall(fillTestWaypoints).then(fillTestRaces);
}