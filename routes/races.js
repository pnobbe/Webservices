'use strict';

const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const Race = mongoose.model('Race');

/**
 * @swagger
 * definitions:
 *   Race:
 *     properties:
 *       name:
 *         type: string
 */

/**
 * @swagger
 * /:
 *   get:
 *     tags:
 *       - Races
 *     description: Returns all races
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of races
 *         schema:
 *           $ref: '#/definitions/Race'
 */
router.get('/', function(req, res){
    res.send("hello race");
});
// GET all movies
function list(req, res, next) {
    res.json({movies: db.find()});
}

// GET a single movie
function get(req, res, next) {
    var movie = db.find(req.swagger.params.id.value);
    if (movie) {
        res.json(movie);
    }
    else {
        res.status(204).send();
    }
}

// POST save a movie
function save(req, res, next) {
    res.json({success: db.save(req.body), description: "Movie added to the list"});
}

// PUT update a movie
function update(req, res, next) {
    if (db.update(req.swagger.params.id.value, req.body)) {
        res.json({success: 1, description: "Movie has been updated!"});
    } else {
        res.status(204).send();
    }
}

// DEL delete a movie
function remove(req, res, next) {
    if (db.remove(req.swagger.params.id.value)) {
        res.json({success: 1, description: "Movie removed successfully."});
    }
    else {
        res.status(204).send();
    }
}

//export this router to use in our index.js
module.exports = router;