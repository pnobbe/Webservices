var port = 3001;
var socket = io('http://localhost:' + port);

socket.on('connect', function () {
    console.log("Successfully connected to socket on port " + port);
});

socket.on('message', function (message) {
    console.log("Host emits message: " + message);
});

socket.on('data', function (message) {
    console.log(message);
    message.waypoints.forEach(function(id) {
        addWaypoint(id);
    });
    message.races.forEach(function(id) {
        addRace(id);
    });
});

socket.on('disconnect', function () {
    console.log("Disconnected from socket on port " + port);
});

