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
 * /races/:
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
 * /races/:name/participants:
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
        res.format({
            json: function () {
                console.log(Race.printJSON(data).participants);
                res.status(200).send(Race.printJSON(data).participants);
            },
            html: function () {
                res.status(200).send(Race.printHTMLParticipants(data));
            }
        });
    });


});


/**
 * @swagger
 * /races/:name/participants:
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
    Race.updateRace(name, {participants: req.body.participants}, function (message, success) {

        if (!success) {
            res.status(400).send({error: message});
        }
        else {

            io.emit('update_race', {name: name, body: req.body});

            res.format({
                html: function () {
                    res.status(200).send(Race.printHTMLParticipants(success));
                },
                json: function () {
                    res.status(200).send(Race.printJSON(success).participants);
                }
            })
        }
    });
});

/**
 * @swagger
 * /races/:name/participants:
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
    Race.updateRace(name, {participants: []}, function (message, success) {

        if (!success) {
            res.status(400).send({error: message});
        }
        else {

            io.emit('update_race', {name: name, body: req.body});

            res.format({
                html: function () {
                    res.status(200).send('<p>participants have been removed successfully.</p>');
                },

                json: function () {
                    res.status(200).send({
                        message: "participants have been removed successfully",
                        race: Race.printJSON(race)
                    });
                }
            })
        }
    });
});


//export this router to use in our index.js
module.exports = router;