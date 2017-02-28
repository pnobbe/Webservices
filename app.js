'use strict';

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var SwaggerExpress = require('swagger-express-mw');

// Data Access Layer
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/bookstore');
mongoose.Promise = require('q').Promise;
//mongoose.Promise = global.Promise;

// /Data Access Layer

// Models
require('./models/book');
require('./models/author');
require('./models/fillTestData')();
// /Models

var config = {
    appRoot: __dirname // required config
};

function handleError(req, res, statusCode, message){
    console.log();
    console.log('-------- Error handled --------');
    console.log('Request Params: ' + JSON.stringify(req.params));
    console.log('Request Body: ' + JSON.stringify(req.body));
    console.log('Response sent: Statuscode ' + statusCode + ', Message "' + message + '"');
    console.log('-------- /Error handled --------');
    res.status(statusCode);
    res.json(message);
};

var app = express();

var config = {
    appRoot: __dirname // required config
};

SwaggerExpress.create(config, function(err, swaggerExpress) {
    if (err) { throw err; }

    // install middleware
    swaggerExpress.register(app);

    // Serve the Swagger documents and Swagger UI
    app.use(swaggerExpress.runner.swaggerTools.swaggerUi());

    var port = process.env.PORT || 10010;
    app.listen(port);

    if (swaggerExpress.runner.swagger.paths['/hello']) {
        console.log('try this:\ncurl http://127.0.0.1:' + port + '/hello?name=Scott');
    }
});

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

module.exports = app; // for testing
