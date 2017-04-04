//const socket = io.connect('http://127.0.0.1:3001', {secure: true});
const socket = io.connect("176.34.228.27:3001", {secure: true});

socket.on('connect', function () {
    console.log("Successfully connected to socket on port ");
});

socket.on('message', function (message) {
    console.log("Host emits message: " + message);
});

socket.on('disconnect', function () {
    console.log("Disconnected from socket on port ");
});