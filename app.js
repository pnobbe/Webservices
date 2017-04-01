'use strict';

const SwaggerExpress = require('swagger-express-mw');
const app = require('express')();

const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

module.exports = app; // for testing

const config = {
    appRoot: __dirname // required config
};

/**
 * NoSQL/Mongoose
 */

// Data Access Layer
var mongoose = require('mongoose');

mongoose.connect('mongodb://user1:user1@ds147510.mlab.com:47510/kroegentocht');
mongoose.Promise = require('q').Promise;
//mongoose.Promise = global.Promise;

// Models
require('./models/user');
require('./models/waypoint');
require('./models/race');
require('./models/fillTestData')();

/**
 * Swagger
 */

SwaggerExpress.create(config, function (err, swaggerExpress) {
    if (err) {
        throw err;
    }

    // Install middleware
    swaggerExpress.register(app);

    // Serve the Swagger documents and Swagger UI
    app.use(swaggerExpress.runner.swaggerTools.swaggerUi());

    var port = process.env.PORT || 10010;
    app.listen(port);

    console.log('Go here for documentation: \nlocalhost:' + port + '/docs');

});

/**
 * Sockets
 */

// Run server to listen on port 3000.
const server = app.listen(3000, () => {
    console.log('Sockets listening on *:3000');
});

const io = require('socket.io')(server);

app.use(bodyParser.urlencoded({ extended: false } ));
app.use(express.static('static'));

// Set socket.io listeners.
io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});
