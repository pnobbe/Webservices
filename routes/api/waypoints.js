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
    const io = req.app.get('io');

    Waypoint.findAll(function (errors, data) {

        if (errors) {
            res.status(400).send({error: "An error occurred"});
        }
        else {
            res.format({
                json: function () {
                    res.status(200).send(data.map(el => {
                        if (el.lat) {
                            return {
                                id: el.waypoint.id,
                                name: el.waypoint.name,
                                address: el.address,
                                lat: el.lat,
                                lng: el.lng
                            };
                        }
                        return {id: el.waypoint.id, name: el.waypoint.name};
                    }));
                },
                html: function () {
                    let resp = "<div>";
                    data.forEach(function (data) {
                        resp += "<div>";
                        resp += "<h3>" + data.waypoint.name + "</h3>";
                        resp += "<h2>" + data.waypoint.id + "</h2>";

                        if (el.lat) {
                            resp += "<h3>" + data.address + "</h3>";
                            resp += "<h4 class='LAT'>" + data.lat + "</h4>";
                            resp += "<h4 class='LNG'>" + data.lng + "</h4>";
                        }
                        resp += "</div>";
                    });
                    resp += "</div>";
                    res.status(200).send(resp);
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

            io.emit('delete_user', { email: email });

            res.format({
                    html: function () {
                        res.status(200).send('<p> Waypoint has been created successfully. </p>');
                    },

                    json: function () {

                        var obj = {
                            id: waypoint.waypoint.id,
                            name: waypoint.waypoint.name

                        };

                        if (waypoint.lat) {
                            obj.address = waypoint.address;
                            obj.lat = waypoint.lat;
                            obj.lng = waypoint.lng;
                        }


                        res.status(200).send({message: "Waypoint has been created successfully.", waypoint: obj});
                    }
                }
            )
        }
    })
    ;


})
;

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
    const io = req.app.get('io');

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

                    var obj = {
                        id: waypoint.waypoint.id,
                        name: waypoint.waypoint.name

                    };

                    if (waypoint.lat) {
                        obj.address = waypoint.address;
                        obj.lat = waypoint.lat;
                        obj.lng = waypoint.lng;
                    }
                    res.status(200).send(obj);

                } else {
                    res.status(400).send({error: "No waypoint found with that id."});
                }
            }.bind(res),
            html: function () {
                console.log("html");
                if (user) {
                    var resp = "";
                    resp += "<div>";

                    resp += "<h2>" + waypoint.waypoint.id + "</h2>";
                    resp += "<h2>" + waypoint.waypoint.name + "</h2>";
                    if (el.lat) {
                        resp += "<h3>" + data.address + "</h3>";
                        resp += "<h4 class='LAT'>" + waypoint.lat + "</h4>";
                        resp += "<h4 class='LNG'>" + waypoint.lng + "</h4>";
                    }
                    resp += "</div>";
                    res.status(200).send('resp');
                } else {
                    res.status(400).send('<strong>No waypoint found with that id. </strong>');
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
    }
    // Call User.update
    Waypoint.updateWaypoint(id, req.body, function (message, waypoint) {

        if (!waypoint) {
            res.status(400).send({error: message});
        }
        else {

            io.emit('update_waypoint', { id: id, body: req.body });

            res.format({
                json: function () {
                    var obj = {
                        id: waypoint.waypoint.id,
                        name: waypoint.waypoint.name

                    };

                    if (waypoint.lat) {
                        obj.address = waypoint.address;
                        obj.lat = waypoint.lat;
                        obj.lng = waypoint.lng;
                    }
                    res.status(200).send(obj);

                },
                html: function () {

                    var resp = "";
                    resp += "<div>";

                    resp += "<h2>" + waypoint.waypoint.id + "</h2>";
                    resp += "<h2>" + waypoint.waypoint.name + "</h2>";
                    if (el.lat) {
                        resp += "<h3>" + waypoint.address + "</h3>";
                        resp += "<h4 class='LAT'>" + waypoint.lat + "</h4>";
                        resp += "<h4 class='LNG'>" + waypoint.lng + "</h4>";
                    }
                    resp += "</div>";
                    res.status(200).send('resp');

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
    }

    Waypoint.deleteWaypoint(id, function (errors) {

        if (errors) {
            res.status(400).send({error: "Error deleting " + id});
        }
        else {

            io.emit('delete_waypoint', { id: id });

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