'use strict';

const express = require('express');
const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const routes = require('./routes/index');
const os = require("os");
const app = express();

/**
 * Swagger
 */

const swaggerDefinition = {
    info: {
        title: 'ReST Race API',
        version: '0.0.1',
        description: 'The official ReST-Race API',
    },
    host: os.hostname(),
    basePath: '/',
};

// options for the swagger docs
const options = {
    // import swaggerDefinitions
    swaggerDefinition: swaggerDefinition,
    // path to the API docs
    apis: ['./routes/*.js'],
};

// initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);// serve swagger

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * NoSQL/Mongoose
 */

// Data Access Layer
const mongoose = require('mongoose');

mongoose.connect('mongodb://user1:user1@ds147510.mlab.com:47510/kroegentocht');
mongoose.Promise = require('q').Promise;
//mongoose.Promise = global.Promise;

// Models
require('./models/user');
require('./models/waypoint');
require('./models/race');
require('./models/fillTestData')();


/**
 * Sockets
 */

/*
 // Run server to listen on port 3000.
 const server = app.listen(3001, () => {
 console.log('Sockets listening on *:3001');
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
 */

/**
 * Routing
 */

const indexRouter = require('./routes/index');
const apiRouter = require('./routes/api');

app.use('/swagger.json', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

app.use("/", indexRouter);
app.use("/api", apiRouter);


const config = {
    appRoot: __dirname // required config
};

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/**
 * Error Handlers
 */

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status( err.code || 500 )
            .json({
                status: 'error',
                message: err
            });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500)
        .json({
            status: 'error',
            message: err.message
        });
});

module.exports = app; // for testing
