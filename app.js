'use strict';

/**
 * Setup
 */

const express = require('express');
const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');
const morgan = require('morgan');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const app = express();

const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const ConnectRoles = require('connect-roles');

const session = require('express-session');
const configDB = require('./config/db');
const passportSocketIo = require("passport.socketio");
const MongoStore = require('connect-mongo')(session);
const socketio = require("socket.io");


const config = require('./config/config');

/**
 * Swagger
 */
const swaggerDefinition = {
    info: {
        title: 'ReST Race API',
        version: '0.0.1',
        description: 'The official ReST-Race API',
    },
    host: config.url,
    basePath: '/api',
    produces: ["application/json", "text/html"],
};

// options for the swagger docs
const options = {
    // import swaggerDefinitions
    swaggerDefinition: swaggerDefinition,
    // path to the API docs
    apis: ['./routes/api/*.js'],
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
if (configDB.testing) {
    mongoose.connect(configDB.test_url);

}
else {
    mongoose.connect(configDB.url);
}

const sessionStore = new MongoStore({mongooseConnection: mongoose.connection});


mongoose.Promise = require('q').Promise;
//mongoose.Promise = global.Promise;

// Models
require('./models/user');
require('./models/waypoint');
require('./models/race');

// require('./models/fillTestData')();


console.log("Done.");

/**
 * Passport
 */

console.log("Initializing Passport... ");

//const origin = require('./config/origin')(app);
require('./routes/passport/init')(passport); // pass passport for configuration

// Configuring Passport
app.use(session({
    key: 'express.sid',
    secret: 'GerardJolingIsEenBaas',
    store: sessionStore,
    resave: true,
    saveUninitialized: false
})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


const user = new ConnectRoles({
    failureHandler: function (req, res, action) {
        // optional function to customise code that runs when
        // user fails authorisation
        var accept = req.headers.accept || '';
        res.status(403);
        if (~accept.indexOf('html')) {
            if (req.isAuthenticated()) {
                res.redirect('/profile');
            }
            else {
                res.redirect('/');
            }
        } else {
            res.send('Access Denied - You don\'t have permission to: ' + action);
        }
    }
});
app.use(user.middleware());


user.use(function (req, action) {
    req.session.returnTo = req.path;
    if (!req.isAuthenticated()) return action === 'access home page';
})

user.use(function (req, action) {
    req.session.returnTo = req.path;
    console.log(req.user.isAdmin);
    if (!req.user.isAdmin) return action === 'access profile page';
})

//admin users can access all pages
user.use(function (req) {
    req.session.returnTo = req.path;
    if (req.user.isAdmin) {
        return true;
    }
});


app.set('user', user);


console.log("Done.");


/**
 * Routing
 */

console.log("Initializing Routes... ");

app.use('/swagger.json', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

require('./routes/index')(app, passport, user); // load our routes and pass in our app and fully configured passport

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

console.log("Done.");

/**
 * Sockets
 */

console.log("Opening sockets... ");

// Socket.io
var io = socketio();
app.io = io;


app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static('static'));

//With Socket.io >= 1.0
io.use(passportSocketIo.authorize({
    cookieParser: cookieParser,       // the same middleware you registrer in express
    key: 'express.sid',       // the name of the cookie where express/connect stores its session_id
    secret: 'GerardJolingIsEenBaas',    // the session_secret to parse the cookie
    store: sessionStore,        // we NEED to use a sessionstore. no memorystore please
    success: onAuthorizeSuccess,  // *optional* callback on success - read more below
    fail: onAuthorizeFail,     // *optional* callback on fail/error - read more below
}));

function onAuthorizeSuccess(data, accept) {
    accept(null, true);
}

function onAuthorizeFail(data, message, error, accept) {
    if (error)
        throw new Error(message);
    accept(null, false);
}

// Set socket.io listeners.
io.on('connection', (socket) => {

    socket.on('join_room', function (name) {
        socket.join(name);
    });

    socket.on('leave_room', function (name) {
        socket.leave(name);
    });

    socket.on('remove_marker', function (data) {
        console.log(data.waypoint);
        io.sockets.in(data.roomname).emit('remove_marker', data.waypoint);
    });

    socket.on('new_race', function () {
        raceCount++;
        races.push(raceCount);
        io.sockets.emit("new_race", raceCount);
    });

    socket.on('delete_race', function (id) {
        races.splice(id - 1, 1);
        io.sockets.emit("delete_race", id);
    });

    socket.on('delete_user', function (id) {
        users.splice(id - 1, 1);
        io.sockets.emit("delete_users", id);
    });

});
app.set('io', io);
console.log("Done.");

/**
 * Error Handlers
 */

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.code || 500)
            .send(err.message);
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
