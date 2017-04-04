const port = 3001;
//const socket = io.connect('http://127.0.0.1:' + port);
const socket = io.connect("https://restrace.herokuapp.com" + port);

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