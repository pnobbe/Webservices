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
 *     accepts:
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
        res.format({
            json: function () {
                res.status(200).send(data);
            },
            html: function () {
                res.status(200).send(Race.printHTMLWaypoints(data));
            }
        });
    });


});


/**
 * @swagger
 * /races/:name/waypoints:
 *   put:
 *     tags:
 *      - Races
 *     description: Updates patricipants
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
 *         description: Updated race
 */
router.put('/', function (req, res) {
    const io = req.app.get('io');

    var name;
    if (req.params.name) {
        name = req.params.name;
    } else {
        res.status(400).send({error: "An error occurred"});
        return;
    }
    // Call Race.update
    Race.updateRace(name, req.body, function (message, success) {

        if (!success) {
            res.status(400).send({error: message});
        }
        else {

            io.emit('update_race', {name: name, body: req.body});

            res.format({
                html: function () {
                    res.status(200).send(Race.printHTMLWaypoints(success));
                },
                json: function () {
                    res.status(200).send(Race.printJSON(success).waypoints);
                }
            })
        }
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

    var name;
    if (req.params.name) {
        name = req.params.name;
    } else {
        res.status(400).send({error: "An error occurred"});
        return;
    }
    // Call Race.update
    Race.updateRace(name, {waypoints: []}, function (message, success) {

        if (!success) {
            res.status(400).send({error: message});
        }
        else {

            io.emit('update_race', {name: name, body: req.body});

            res.format({
                html: function () {
                    res.status(200).send('<p>waypoints have been removed successfully.</p>');
                },

                json: function () {
                    res.status(200).send({
                        message: "waypoints have been removed successfully",
                        race: Race.printJSON(race)
                    });
                }
            })
        }
    });
});


//export this router to use in our index.js
module.exports = router;