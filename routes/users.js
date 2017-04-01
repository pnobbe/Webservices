var express = require('express');
var router = express();
var _ = require('underscore');
var handleError;
var async = require('async');

var mongoose = require('mongoose');
User = mongoose.model('User');

function getUsers(req, res) {
    var query = {};
    if (req.params.id) {
        query._id = req.params.id.toLowerCase();
    }

    User.find(query).then(data => {
            if (req.params.id) {
                data = data[0];
            }

            res.json(data);

        }
    )
};

// Routing
router.route('/')
    .get(getUsers);


// Export
module.exports = function (errCallback) {
    console.log('Initializing authors routing module');

    handleError = errCallback;
    return router;
}