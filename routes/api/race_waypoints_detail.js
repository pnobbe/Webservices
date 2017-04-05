const express = require('express');
const router = express.Router({mergeParams: true});
const Regex = require('../../service/regex');
const mongoose = require('mongoose');
const Race = mongoose.model('Race');
const User = mongoose.model('User');
const Waypoint = mongoose.model('Waypoint');

function parse(req, res, callback) {
    var name;
    if (req.params.name) {
        name = req.params.name;
    } else {
        res.status(400).send({error: "An error occurred"});
        return;
    }

    Race.findByName(name, function (errors, data) {
        if (errors) {
            res.status(400).send({error: "An error occurred."});
            return;
        }
        let race = data;
        if (!race) {
            res.format({
                json: function () {
                    res.status(400).send({error: "No race found with that name."});
                },
                html: function () {
                    res.status(400).send('<strong>No race found with that name.</strong>');
                }
            });
        }
        else {
            callback(race);
        }
    });

}


/**
 * @swagger
 * /races/:name/waypoints/:id:
 *   post:
 *     tags:
 *       - Races
 *     description: Creates patricipants
 *     produces:
 *     responses:
 *       404:
 *         description: not implemented.
 */
router.post('/', function (req, res, next) {
    res.status(404).send("Not implemented");
});

/**
 * @swagger
 * /races/:name/waypoints/:id:
 *   get:
 *     tags:
 *       - Races
 *     description: Returns patricipants
 *     provides:
 *       - application/json
 *       - text/html
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
router.get('/', function (req, res) {

    parse(req, res, data => {

        // filter waypoints object
        var id;
        if (req.params.id) {
            id = req.params.id;
        } else {
            res.status(400).send({error: "An error occurred"});
            return;
        }

        data = data.waypoints.filter(data => {
            if (!data.waypoint) {
                return false;
            }
            return data.waypoint.id == id;
        });

        if (data.length == 0) {
            res.format({
                json: function () {
                    res.status(400).send({error: "No waypoint found with that id."});
                },
                html: function () {
                    res.status(400).send('<strong>No waypoint found with that id.</strong>');
                }
            });
        }
        else {
            res.format({
                json: function () {
                    res.status(200).send(data);

                },
                html: function () {
                    res.status(200).send(Race.printHTMLWaypoints(data));
                }
            });
        }

    });


});


/**
 * @swagger
 * /races/:name/waypoints:
 *   put:
 *     tags:
 *      - Races
 *     description: Updates waypoint
 *     produces: application/json
 *     parameters:
 *       name: race
 *       in: body
 *       description: Fields for the Race resource
 *       schema:
 *         type: object
 *         $ref: '#/definitions/Race'
 *     responses:
 *       200:
 *         description: Updated passed people
 */
router.put('/', function (req, res) {
    const io = req.app.get('io');

    parse(req, res, data => {

        // filter waypoints object
        var id;
        if (req.params.id) {
            id = req.params.id;
        } else {
            res.status(400).send({error: "An error occurred"});
            return;
        }

        var newWaypoints = data.waypoints.filter(data => {
            if (!data.waypoint) {
                return true;
            }
            return data.waypoint.id != id;
        });

        newWaypoints.push(req.body);

        // PUT in race (change passed people)
        Race.updateRace(data.name, {waypoints: newWaypoints}, function (message, success) {

                if (!success) {
                    res.status(400).send({error: message});
                }
                else {

                    io.to(data.name).emit('update_race_data', success);
                    io.emit('update_race', success);

                    res.format({
                        html: function () {
                            res.status(200).send({message: "Put successfull"});
                        },
                        json: function () {
                            res.status(200).send("<p>Put successfull</p>");
                        }
                    })
                }
            }
        );

    });
});

/**
 * @swagger
 * /races/:name/waypoints/:id:
 *   delete:
 *     tags:
 *       - Races
 *     description: Deletes patricipants
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: race
 *         description: Race's names
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Successfully deleted
 */
router.delete('/', function (req, res) {
    const io = req.app.get('io');

    parse(req, res, data => {

        // filter waypoints object
        var id;
        if (req.params.id) {
            id = req.params.id;
        } else {
            res.status(400).send({error: "An error occurred"});
            return;
        }

        var newWaypoints = data.waypoints.filter(data => {
            if (!data.waypoint) {
                return true;
            }
            return data.waypoint.id != id;
        });

        // PUT
        Race.updateRace(data.name, {waypoints: newWaypoints}, function (message, success) {

                if (!success) {
                    res.status(400).send({error: message});
                }
                else {

                    io.to(data.name).emit('update_race_data', success);
                    io.emit('update_race', success);

                    res.format({
                        html: function () {
                            res.status(200).send({message: "Delete succesfull"});
                        },
                        json: function () {
                            res.status(200).send("<p>Delete successfull</p>");
                        }
                    })
                }
            }
        );

    });

});


//export this router to use in our index.js
module.exports = router;