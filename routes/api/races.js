const express = require('express');
const router = express.Router();
const Regex = require('../../service/regex');
const mongoose = require('mongoose');
const Race = mongoose.model('Race');
const User = mongoose.model('User');
const Waypoint = mongoose.model('Waypoint');
/**
 * @swagger
 * definitions:
 *   Race:
 *     properties:
 *       name:
 *         type: string
 *       city:
 *         type: string
 *       creationdate:
 *         type: string
 *         format: date
 *       owner:
 *         type: object
 *         $ref: '#/definitions/User'
 *       participants:
 *         type: array
 *         items:
 *           $ref: '#/definitions/User'
 *       waypoints:
 *         type: object
 *         properties:
 *           waypoint:
 *             $ref: '#/definitions/Waypoint'
 *           passed_participants:
 *             $ref: '#/definitions/passed_participants'
 *     required:
 *      - name
 *      - city
 */

/**
 * @swagger
 * /races/all/{page}/{limit}:
 *   get:
 *     tags:
 *       - Races
 *     description: Returns all races.
 *     produces:
 *       - application/json
 *       - text/html
 *     parameters:
 *       - name: page
 *         description: pagination return page
 *         in: path
 *         required: false
 *         type: number
 *       - name: limit
 *         description: pagination page size
 *         in: path
 *         required: false
 *         type: number
 *     responses:
 *       200:
 *         description: An array of races
 *         schema:
 *         type: object
 *         properties:
 *           result:
 *             type: array
 *             items:
 *               $ref: '#/definitions/Race'
 *             required: true
 *           page:
 *             type: number
 *             required: true
 *           limit:
 *             type: number
 *             required: true
 *           notice:
 *             type: string
 *       400:
 *         description: An error occured
 *         type: object
 *         properties:
 *           error:
 *             type: string
 */
router.get('/all/:page?/:limit?', function (req, res, next) {
    const io = req.app.get('io');

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
    var allowed = ["city", "name", "owner"];
    var queries = {};
    for (var k in req.query) {
        if (req.query.hasOwnProperty(k) && allowed.includes(k)) {
            queries[k.toString()] = {$regex: Regex.parse(req.query[k]), $options: "i"}
        }
    }

    Race.find(queries, function (errors, data) {

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
                        result: data.map(Race.printJSON)
                    };
                    res.status(200).send(val);
                },
                html: function () {
                    let resp = "<div>";
                    if (error) {
                        resp += "<h3>Notice " + error + "</h3>";
                    }
                    resp += "<h3>PAGE " + page + "</h3>";
                    resp += "<h3>LIMIT " + limit + "</h3>";
                    resp += "<h1>DATA </h1>";
                    data.forEach(function (data) {
                        resp += Race.printHTML(data);
                    });

                    resp += "</div>";
                    res.status(200).send(resp);
                }
            });
        }
    }).skip(offset).limit(limit).populate("owner");
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
 *       - text/html
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
 *       400:
 *         description: Error creating new user
 */
router.post('/', function (req, res, next) {
    const io = req.app.get('io');
    if (req.body.owner == null) {
        req.body.owner = req.user;
    }

    // Call Race.create
    Race.createNew(req.body, function (errors, race, info) {

        if (errors) {
            res.status(400).send({error: "An error occurred"});
        }
        else if (info) {
            res.status(400).send({error: info});
        }
        else {

            io.emit('new_race', race);

            res.format({
                html: function () {
                    res.status(200).send('<p>Race has been created successfully.</p>');
                },

                json: function () {
                    res.status(200).send({message: "Race has been created successfully.", race: Race.printJSON(race)});
                }
            })
        }
    });


});

/**
 * @swagger
 * /races/{name}:
 *   get:
 *     tags:
 *       - Races
 *     description: Returns a single race
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
 *         description: A single race
 *         schema:
 *           $ref: '#/definitions/Race'
 *       400:
 *         description: Error retrieving race
 */
router.get('/:name', function (req, res) {
    const io = req.app.get('io');

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

        res.format({
            json: function () {
                if (race) {
                    res.status(200).send(Race.printJSON(race));
                } else {
                    res.status(400).send({error: "No race found with that name."});
                }
            },
            html: function () {
                if (race) {
                    res.status(200).send(Race.printHTML(race));
                } else {
                    res.status(400).send('<strong>No race found with that name.</strong>');
                }
            }
        });
    });


});


/**
 * @swagger
 * /races/{name}:
 *   put:
 *     tags:
 *      - Races
 *     description: Updates a single race
 *     produces:
 *       - application/json
 *       - text/html
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
 *       400:
 *         description: Error updating race
 */
router.put('/:name', function (req, res) {
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

            io.to(name).emit('update_race_data', success);
            io.emit('update_race', success);

            res.format({
                html: function () {
                    res.status(200).send(Race.printHTML(success));
                },
                json: function () {
                    res.status(200).send(Race.printJSON(success));
                }
            })
        }
    });
});

/**
 * @swagger
 * /races/{name}:
 *   delete:
 *     tags:
 *       - Races
 *     description: Deletes a single race
 *     produces:
 *       - application/json
 *       - text/html
 *     parameters:
 *       - name: race
 *         description: Race's names
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Successfully deleted
 *       400:
 *         description: Error deleting race
 */
router.delete('/:name', function (req, res) {
    const io = req.app.get('io');

    var name;
    if (req.params.name) {
        name = req.params.name;
    } else {
        res.status(400).send({error: "An error occurred"});
        return;
    }

    Race.deleteRace(name, function (errors) {

        if (errors) {
            res.status(400).send("Error deleting " + name);
        }
        else {

            io.emit('delete_race', name);
            console.log(name);
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


router.use('/:name/participants', require('./race_participants'));
router.use('/:name/waypoints', require('./race_waypoints'));


//export this router to use in our index.js
module.exports = router;