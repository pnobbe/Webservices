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
 * /races/{name}/waypoints:
 *   get:
 *     tags:
 *       - Races
 *     description: Returns waypoints
 *     produces:
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
 *         description: Array of waypoints
 *         schema:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               waypoint:
 *                 $ref: '#/definitions/Waypoint'
 *               passed_participants:
 *                 $ref: '#/definitions/passed_participants'
 *       400:
 *         description: Error retrieving waypoints
 */
router.get('/', function (req, res) {

    parse(req, res, data => {
        res.format({
            json: function () {
                res.status(200).send(Race.printJSON(data).waypoints);
            },
            html: function () {
                res.status(200).send(Race.printHTMLWaypoints(data.waypoints));
            }
        });
    });


});


/**
 * @swagger
 * /races/{name}/waypoints:
 *   put:
 *     tags:
 *      - Races
 *     description: Updates participants
 *     produces:
 *       - application/json
 *       - text/html
 *     parameters:
 *     - name: waypoints
 *       description: Array of waypoints
 *       in: body
 *       required: true
 *       schema:
 *         type: array
 *         items:
 *           type: object
 *           properties:
 *             waypoint:
 *               $ref: '#/definitions/Waypoint'
 *             passed_participants:
 *               $ref: '#/definitions/passed_participants'
 *     responses:
 *       200:
 *         description: Updated race participants
 *       400:
 *         description: Error updating race participants
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
    Race.updateRace(name, {waypoints: req.body.waypoints}, function (message, success) {

        if (!success) {
            res.status(400).send({error: message});
            return;
        }
        else {

            io.emit('update_race', {name: name, body: req.body});

            res.format({
                html: function () {
                    res.status(200).send(Race.printHTMLWaypoints(success.waypoints));
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
 * /races/{name}/waypoints:
 *   delete:
 *     tags:
 *       - Races
 *     description: Deletes waypoints
 *     produces:
 *       - application/json
 *       - text/html
 *     parameters:
 *       - name: name
 *         description: Race's names
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Successfully deleted waypoints
 *       400:
 *         description: Error deleting waypoints
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

router.use('/:id', require('./race_waypoints_detail'));


//export this router to use in our index.js
module.exports = router;