'use strict';
var express = require('express');
var router = express();
var _ = require('underscore');
var async = require('async');
var mongoose = require('mongoose');
var User = mongoose.model('User');

// Export functions
module.exports = {list, save, get, update, remove};

// GET all users
function list(req, res, next) {
    User.find({})
        .then(data => {
            var users = {};
            users.users = data;
            console.log(users);
            res.json(users);
        }).fail(res.status(204).send());
}

// GET a single user
function get(req, res, next) {
    var query = {};
    if (req.swagger.params.name.value) {
        query.name = req.swagger.params.name.value;
    } else {
        res.status(204).send();
    }

    User.find(query)
        .then(data => {
            if (req.swagger.params.name.value) {
                data = data[0];
            }
            console.log(data);

            res.json(data);
        }).fail(res.status(204).send());
}

// POST save a user
function save(req, res, next) {
    var user1 = new User();
    user1.name = req.body.name;
    user1.email = req.body.email;

    user1.save(function (err) {
        if (err) {
            res.json({success: 0, description: err.message})
        }
        ;
        res.format({
            'text/html': function () {
                return res.status(200).send('<html><body><h1>Success</h1></body></html>');
            },

            'application/json': function () {
                res.json({success: 1, description: "User added to the list"});
            }
        })
    })

}

// PUT update a user
function update(req, res, next) {
    if (db.update(req.swagger.params.id.value, req.body)) {
        res.json({success: 1, description: "User has been updated!"});
    } else {
        res.status(204).send();
    }
}

// DEL delete a user
function remove(req, res, next) {
    if (db.remove(req.swagger.params.id.value)) {
        res.json({success: 1, description: "User removed successfully."});
    }
    else {
        res.status(204).send();
    }
}