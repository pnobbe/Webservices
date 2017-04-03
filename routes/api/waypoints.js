const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const Waypoint = mongoose.model('Waypoint');


/**
 * @swagger
 * definitions:
 *   Waypoint:
 *     properties:
 *       email:
 *         type: string
 *       name:
 *         type: string
 *       password:
 *         type: string
 *     required:
 *      - email
 *      - name
 *      - password
 *
 */

/**
 * @swagger
 * /waypoints/:
 *   get:
 *     tags:
 *       - Users
 *     description: Returns all users
 *     accepts:
 *       - application/json
 *       - text/html
 *     responses:
 *       200:
 *         description: An array of users
 *         schema:
 *           $ref: '#/definitions/Waypoint'
 */
router.get('/', function (req, res, next) {

    Waypoint.find({}, function (errors, data) {

        if (errors) {
            res.status(400).send({error: "An error occurred"});
        }
        else {
            res.format({
                json: function () {
                    res.status(200).send(data);
                },
                html: function () {
                    let resp = "";
                    data.forEach(function (data) {
                        resp += "<p>" + data.name + "</p>"
                    });
                    res.status(200).send('<div>' + res + '</div>');
                }
            });
        }
    });

});

/**
 * @swagger
 * /waypoints/:
 *   post:
 *     tags:
 *       - Waypoints
 *     description: Creates a new waypoint
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Waypoint
 *         description: Waypoint object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Waypoint'
 *     responses:
 *       200:
 *         description: Successfully created
 *       500:
 *         description: An error occurred.
 */
router.post('/', function (req, res, next) {

    // Call User.create
    Waypoint.createNew(req.body, function (errors, waypoint, info) {

        if (errors) {
            res.status(400).send({error: "An error occurred"});
        }
        else if (info) {
            res.status(400).send({error: info});
        }
        else {
            res.format({
                html: function () {
                    res.status(200).send('<p> Waypoint has been created successfully. </p>');
                },

                json: function () {
                    res.status(200).send({message: "Waypoint has been created successfully.", waypoint: waypoint});
                }
            })
        }
    });


});

/**
 * @swagger
 * /waypoints/:id:
 *   get:
 *     tags:
 *       - Waypoints
 *     description: Returns a single waypoint
 *     accepts:
 *       - application/json
 *       - text/html
 *     parameters:
 *       - name: id
 *         description: Waypoint's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: A single waypoint
 *         schema:
 *           $ref: '#/definitions/Waypoint'
 */
router.get('/:id', function (req, res) {
    var id;
    if (req.params.id) {
        id = req.params.id;
    } else {
        res.status(400).send({error: "An error occurred"});
    }

    Waypoint.findById(id, function (errors, data) {

        if (errors) {
            res.status(400).send({error: "An error occurred"});
        }

        let waypoint = data;
        res.format({
            json: function () {
                console.log("json");
                if (waypoint) {
                    res.status(200).send(waypoint);
                } else {
                    res.status(400).send({error: "No waypoint found with that id."});
                }
            }.bind(res),
            html: function () {
                console.log("html");
                if (user) {
                    res.status(200).send('<h1>' + waypoint.name + '</h1>');
                } else {
                    res.status(400).send('<strong>No waypoint found with that id. </strong>');
                }
            }
        });
    });


});

/**
 * @swagger
 * /waypoints/:id:
 *   put:
 *     tags:
 *      - Waypoints
 *     description: Updates a single waypoint
 *     produces: application/json
 *     parameters:
 *       id: waypoint
 *       in: body
 *       description: Fields for the waypoint resource
 *       schema:
 *         type: object
 *         $ref: '#/definitions/Waypoint'
 *     responses:
 *       200:
 *         description: Updated waypoint
 */
router.put('/:id', function (req, res) {
    var id;
    if (req.params.id) {
        id = req.params.id;
    } else {
        res.status(400).send({error: "An error occurred"});
    }
    // Call User.update
    Waypoint.updateWaypoint(id, req.body, function (message, success) {

        if (!success) {
            res.status(400).send({error: message});
        }
        else {
            res.format({
                html: function () {
                    res.status(200).send('<p> success.name</p>');
                },

                json: function () {
                    res.status(200).send(success);
                }
            })
        }
    });
});

/**
 * @swagger
 * /waypoints/:id:
 *   delete:
 *     tags:
 *       - Waypoints
 *     description: Deletes a single waypoint
 *     produces:
 *       - application/json
 *     parameters:
 *       - id: waypoint
 *         description: waypoint id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Successfully deleted
 */
router.delete('/:id', function (req, res) {
    var id;
    if (req.params.id) {
        id = req.params.id;
    } else {
        res.status(400).send({error: "An error occurred"});
    }

    Waypoint.deleteWaypoint(id, function (errors) {

        if (errors) {
            res.status(400).send({error: "Error deleting " + id});
        }
        else {
            res.format({
                html: function () {
                    res.status(200).send('<p> Deleted succesfully </p>');
                },

                json: function () {
                    res.status(200).send({message: "Deleted succesfully"});
                }
            })
        }
    });
});

//export this router to use in our index.js
module.exports = router;