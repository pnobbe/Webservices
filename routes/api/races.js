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
 * /races/:
 *   get:
 *     tags:
 *       - Races
 *     description: Returns all races
 *     accepts:
 *       - application/json
 *       - text/html
 *     responses:
 *       200:
 *         description: An array of races
 *         schema:
 *           $ref: '#/definitions/Race'
 */
router.get('/', function (req, res, next) {
    const io = req.app.get('io');

    Race.find({}, function (errors, data) {

        if (errors) {
            res.status(400).send({error: "An error occurred"});
        }
        else {

            res.format({
                json: function () {
                    res.status(200).send(data);
                },
                html: function () {
                    let resp = "<div>";
                    data.forEach(function (data) {
                        resp += "<div>";
                        resp += "<h2>" + data.name + "</h2>";
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
 * /races/:
 *   post:
 *     tags:
 *       - Races
 *     description: Creates a new race
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: race
 *         description: Race object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Race'
 *     responses:
 *       200:
 *         description: Successfully created
 *       500:
 *         description: An error occurred.
 */
router.post('/', function (req, res, next) {
    const io = req.app.get('io');

    // Call Race.create
    Race.createNew(req.body, function (errors, race, info) {

        if (errors) {
            res.status(400).send({error: "An error occurred"});
        }
        else if (info) {
            res.status(400).send({error: info});
        }
        else {

            io.emit('new_race', req.body.name);

            res.format({
                html: function () {
                    res.status(200).send('<p> Race has been created successfully. </p>');
                },

                json: function () {
                    res.status(200).send({message: "Race has been created successfully.", race: race});
                }
            })
        }
    });


});

/**
 * @swagger
 * /races/:name:
 *   get:
 *     tags:
 *       - Races
 *     description: Returns a single race
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
router.get('/:name', function (req, res) {
    const io = req.app.get('io');

    var name;
    if (req.params.name) {
        name = req.params.name;
    } else {
        res.status(400).send({error: "An error occurred"});
    }

    Race.findByName(name, function (errors, data) {

        if (errors) {
            res.status(400).send({error: "An error occurred."});
        }

        let race = data;
        res.format({
            json: function () {
                if (race) {
                    res.status(200).send(race);
                } else {
                    res.status(400).send({error: "No race found with that name."});
                }
            },
            html: function () {
                if (race) {
                    var resp = "";
                    resp += "<div>";
                    resp += "<h2>" + race.name + "</h2>";
                    resp += "</div>";

                    res.status(200).send(resp);
                } else {
                    res.status(400).send('<strong>No race found with that name. </strong>');
                }
            }
        });
    });


});

/**
 * @swagger
 * /races/:name:
 *   put:
 *     tags:
 *      - Races
 *     description: Updates a single race
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
router.put('/:name', function (req, res) {
    const io = req.app.get('io');

    var name;
    if (req.params.name) {
        name = req.params.name;
    } else {
        res.status(400).send({error: "An error occurred"});
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
                    var resp = "";
                    resp += "<div>";
                    resp += "<h2>" + success.name + "</h2>";
                    resp += "</div>";
                    res.status(200).send(resp);
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
 * /races/:name:
 *   delete:
 *     tags:
 *       - Races
 *     description: Deletes a single race
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
router.delete('/:name', function (req, res) {
    const io = req.app.get('io');

    var name;
    if (req.params.name) {
        name = req.params.name;
    } else {
        res.status(400).send({error: "An error occurred"});
    }

    Race.deleteRace(name, function (errors) {

        if (errors) {
            res.status(500).send("Error deleting " + name);
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