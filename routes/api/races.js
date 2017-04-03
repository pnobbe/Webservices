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
 * /api/races/:
 *   get:
 *     tags:
 *       - Races
 *     description: Returns all races
 *     produces:
 *       - application/json
 *       - text/html
 *     responses:
 *       200:
 *         description: An array of races
 *         schema:
 *           $ref: '#/definitions/Race'
 */
router.get('/', function(req, res){
    res.format({
        json: function(){
            res.send({ message: 'Hello race' });
        },
        html: function(){
            res.send('<h1>Hello race</h1>');
        }
    });
});
// GET all movies
function list(req, res, next) {
    res.json({movies: db.find()});
}

/**
 * @swagger
 * /api/races/:name:
 *   get:
 *     tags:
 *       - Races
 *     description: Returns a single race
 *     accepts:
 *       - application/json
 *     parameters:
 *       - name: name
 *         description: Race's name
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: A single race
 *         schema:
 *           $ref: '#/definitions/Race'
 */
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