const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const Waypoint = mongoose.model('Waypoint');
const Regex = require('../../service/regex');

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
 *     provides:
 *       - application/json
 *       - text/html
 *     responses:
 *       200:
 *         description: An array of users
 *         schema:
 *           $ref: '#/definitions/Waypoint'
 */
router.get('/all/:page?/:limit?', function (req, res, next) {
    var page = 1;
    var limit = 10;
    var error;
    if (req.params.page) {
        page = Math.max(req.params.page, 1);
    }
    else {
        error = "Usage: /all/:page/:limit?params";
    }
    if (req.params.limit) {
        limit = Math.max(req.params.limit, 1);
    }
    else {
        error = "Usage: /all/:page/:limit?params";
    }
    var offset = (page - 1) * limit;

    // queries
    var allowed = ["id", "name"];
    var queries = {};
    for (var k in req.query) {
        if (req.query.hasOwnProperty(k) && allowed.includes(k)) {
            queries[k.toString()] = {$regex: Regex.parse(req.query[k]), $options: "i"}
        }
    }

    Waypoint.findAll(queries, offset, limit, function (errors, data) {

        if (errors) {
            res.status(400).send({error: "An error occurred"});
        }
        else {
            res.format({
                json: function () {
                    var val = {
                        page: page,
                        limit: limit,
                        notice: error,
                        result: data.map(Waypoint.printJSON)
                    };
                    res.status(200).send(val);
                },
                html: function () {
                    let resp = "<div>";
                    if (error) {
                        resp = "<h3>Notice " + error + "</h3>";
                    }
                    resp = "<h3>PAGE " + page + "</h3>";
                    resp = "<h3>LIMIT " + limit + "</h3>";
                    resp = "<h1>DATA </h1>";
                    data.forEach(function (data) {
                        resp += Waypoint.printHTML(data);
                    });
                    resp += "</div>";
                    res.status(200).send(resp);
                }
            });
        }
    })
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
 *       400:
 *         description: An error occurred.
 */
router.post('/', function (req, res, next) {
    const io = req.app.get('io');
    // Call User.create
    Waypoint.createNew(req.body, function (errors, waypoint, info) {

        if (errors) {
            res.status(400).send({error: "An error occurred"});
        }
        else if (info) {
            res.status(400).send({error: info});
        }
        else {
            io.emit('new_waypoint', {body: req.body});

            res.format({
                    html: function () {
                        res.status(200).send('<p>Waypoint has been created successfully.</p>');
                    },
                    json: function () {
                        res.status(200).send({
                            message: "Waypoint has been created successfully.",
                            waypoint: Waypoint.printJSON(waypoint)
                        });
                    }
                }
            )
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
 *     provides:
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
        return;
    }

    Waypoint.findById(id, function (errors, data) {

        if (errors) {
            res.status(400).send({error: "An error occurred"});
            return;
        }

        let waypoint = data;
        res.format({
            json: function () {
                if (waypoint) {
                    res.status(200).send(Waypoint.printJSON(waypoint));
                } else {
                    res.status(400).send({error: "No waypoint found with that id."});
                }
            }.bind(res),
            html: function () {
                if (waypoint) {

                    res.status(200).send(Waypoint.printHTML(waypoint));
                } else {
                    res.status(400).send('<strong>No waypoint found with that id.</strong>');
                }
            }
        });
    });


})
;

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
    const io = req.app.get('io');

    var id;
    if (req.params.id) {
        id = req.params.id;
    } else {
        res.status(400).send({error: "An error occurred"});
        return;
    }
    // Call User.update
    Waypoint.updateWaypoint(id, req.body, function (message, waypoint) {

        if (!waypoint) {
            res.status(400).send({error: message});
        }
        else {
            io.emit('update_waypoint', {id: id, body: req.body});

            res.format({
                json: function () {
                    res.status(200).send(Waypoint.printJSON(waypoint));
                },
                html: function () {
                    res.status(200).send(Waypoint.printHTML(waypoint));
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
    const io = req.app.get('io');

    var id;
    if (req.params.id) {
        id = req.params.id;
    } else {
        res.status(400).send({error: "An error occurred"});
        return;
    }

    Waypoint.deleteWaypoint(id, function (errors) {

        if (errors) {
            res.status(400).send({error: "Error deleting " + id});
        }
        else {

            io.emit('delete_waypoint', id);

            res.format({
                html: function () {
                    res.status(200).send('<p>Deleted succesfully</p>');
                },
                json: function () {
                    res.status(200).send({message: "Deleted succesfully"});
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
router.get('/search/nearby/:city', function (req, res) {
    var city;
    if (req.params.city) {
        city = req.params.city;
    } else {
        res.status(400).send({error: "An error occurred"});
        return;
    }


    const Places = require('../../service/places');
    let p = new Places();


    p.getNearbyLocationsbyCity(city).then(data => {
        res.format({
            json: function () {

                res.status(200).send(data.map(Waypoint.printJSON));

            },
            html: function () {

                let resp = "<div>";
                data.forEach(function (data) {
                    resp += Waypoint.printHTML(data);
                });
                resp += "</div>";
                res.status(200).send(resp);

            }
        })
    });
});

/**
 * @swagger
 * /waypoints/search/nearby/:city/:criteria:
 *   get:
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
router.get('/search/nearby/:city/:criteria', function (req, res) {
    var city;
    var criteria;
    if (req.params.city && req.params.criteria) {
        city = req.params.city;
        criteria = req.params.criteria;
    } else {
        res.status(400).send({error: "An error occurred"});
        return;
    }


    const Places = require('../../service/places');
    let p = new Places();


    p.getNearbybyCity(city, criteria).then(data => {
        res.format({
            json: function () {

                res.status(200).send(data.map(Waypoint.printJSON));

            },
            html: function () {

                let resp = "<div>";
                data.forEach(function (data) {
                    resp += Waypoint.printHTML(data);
                });
                resp += "</div>";
                res.status(200).send(resp);

            }
        })


    });
});
//export this router to use in our index.js
module.exports = router;