'use strict';

/**
 * Setup
 */

const express = require('express');
const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');
const morgan       = require('morgan');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const routes = require('./routes/index');
const app = express();

const mongoose = require('mongoose');
const passport = require('passport');
const flash    = require('connect-flash');

const session      = require('express-session');
const configDB = require('./config/db');


const config = {
    appRoot: __dirname // required config
};

/**
 * Swagger
 */

const swaggerDefinition = {
    info: {
        title: 'ReST Race API',
        version: '0.0.1',
        description: 'The official ReST-Race API',
    },
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
app.set('view engine', 'ejs'); // set up ejs for templating

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * NoSQL/Mongoose
 */

console.log("Initializing Mongoose... ");

// Data Access Layer
mongoose.connect(configDB.url);
mongoose.Promise = require('q').Promise;
//mongoose.Promise = global.Promise;

// Models
require('./models/user');
require('./models/waypoint');
require('./models/race');
require('./models/fillTestData')();


console.log("Done.");


/**
 * Sockets
 */

console.log("Opening sockets... ");

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

console.log("Done.");

/**
 * Passport
 */

console.log("Initializing Passport... ");

require('./passport/init')(passport); // pass passport for configuration

// Configuring Passport
app.use(session({secret: 'GerardJolingIsEenBaas'})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// Initialize Passport


console.log("Done.");


/**
 * Routing
 */

console.log("Initializing Routes... ");

app.use('/swagger.json', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

require('./routes/index')(app, passport); // load our routes and pass in our app and fully configured passport


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

console.log("Done.");

/**
 * Error Handlers
 */

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.code || 500)
            .json({
                status: 'error',
                message: err
            });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500)
        .json({
            status: 'error',
            message: err.message
        });
});

module.exports = app; // for testing
