var port = 3001;
var socket = io('http://localhost:' + port);

socket.on('connect', function () {
    console.log("Successfully connected to socket on port " + port);
});

socket.on('message', function (message) {
    console.log("Host emits message: " + message);
});

socket.on('new_client', function (data) {
    console.log("New client connected. (" + data.id + "). \nTotal clients connected: " + data.count);
});
socket.on('disconnect', function () {
    console.log("Disconnected from socket on port " + port);
});