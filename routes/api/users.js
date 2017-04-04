const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const User = mongoose.model('User');


/**
 * @swagger
 * definitions:
 *   User:
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
 * /users/:
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
 *           $ref: '#/definitions/User'
 */
router.get('/', function (req, res, next) {
    const io = req.app.get('io');

    User.find({}, function (errors, data) {

        if (errors) {
            res.status(400).send({error: "An error occurred"});
        }
        else {

            res.format({
                json: function () {
                    res.status(200).send(data.map(el => {
                        return {name: el.name, email: el.email};
                    }));
                },
                html: function () {
                    let resp = "<div>";
                    data.forEach(function (data) {
                        resp += "<div>";
                        resp += "<h2>" + data.name + "</h2>";
                        resp += "<h4>" + data.email + "</h4>";
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
 * /users/:
 *   post:
 *     tags:
 *       - Users
 *     description: Creates a new user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: user
 *         description: User object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/User'
 *     responses:
 *       200:
 *         description: Successfully created
 *       500:
 *         description: An error occurred.
 */
router.post('/', function (req, res, next) {
    const io = req.app.get('io');

    // Call User.create
    User.createNewLocal(req.body, function (errors, user, info) {

        if (errors) {
            res.status(400).send({error: "An error occurred"});
        }
        else if (info) {
            res.status(400).send({error: info});
        }
        else {

            io.emit('new_user', req.body.email);

            res.format({
                html: function () {
                    res.status(200).send('<p> User has been created successfully. </p>');
                },

                json: function () {
                    res.status(200).send({message: "User has been created successfully.", user: user});
                }
            })
        }
    });


});

/**
 * @swagger
 * /users/:email:
 *   get:
 *     tags:
 *       - Users
 *     description: Returns a single user
 *     accepts:
 *       - application/json
 *       - text/html
 *     parameters:
 *       - name: email
 *         description: User's email
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: A single user
 *         schema:
 *           $ref: '#/definitions/User'
 */
router.get('/:email', function (req, res) {
    const io = req.app.get('io');

    var email;
    if (req.params.email) {
        email = req.params.email;
    } else {
        res.status(400).send({error: "An error occurred"});
    }

    User.findByEmail(email, function (errors, data) {

        if (errors) {
            res.status(400).send({error: "An error occurred."});
        }

        let user = data[0];
        res.format({
            json: function () {
                if (user) {
                    res.status(200).send({name: user.name, email: user.email});
                } else {
                    res.status(400).send({error: "No user found with that email."});
                }
            }.bind(res),
            html: function () {
                if (user) {
                    var resp = "";
                    resp += "<div>";
                    resp += "<h2>" + user.name + "</h2>";
                    resp += "<h4>" + user.email + "</h4>";
                    resp += "</div>";

                    res.status(200).send(resp);
                } else {
                    res.status(400).send('<strong>No user found with that email. </strong>');
                }
            }
        });
    });


});

/**
 * @swagger
 * /users/:email:
 *   put:
 *     tags:
 *      - Users
 *     description: Updates a single user
 *     produces: application/json
 *     parameters:
 *       email: user
 *       in: body
 *       description: Fields for the User resource
 *       schema:
 *         type: object
 *         $ref: '#/definitions/User'
 *     responses:
 *       200:
 *         description: Updated user
 */
router.put('/:email', function (req, res) {
    const io = req.app.get('io');

    var email;
    if (req.params.email) {
        email = req.params.email;
    } else {
        res.status(400).send({error: "An error occurred"});
    }
    // Call User.update
    User.updateUser(email, req.body, function (message, success) {

        if (!success) {
            res.status(400).send({error: message});
        }
        else {

            io.emit('update_user', { email: email, body: req.body });

            res.format({
                html: function () {
                    var resp = "";
                    resp += "<div>";
                    resp += "<h2>" + success.name + "</h2>";
                    resp += "<h4>" + success.email + "</h4>";
                    resp += "</div>";
                    res.status(200).send(resp);
                },
                json: function () {
                    res.status(200).send({name: success.name, email: success.email});
                }
            })
        }
    });
});

/**
 * @swagger
 * /users/:name:
 *   delete:
 *     tags:
 *       - Users
 *     description: Deletes a single user
 *     produces:
 *       - application/json
 *     parameters:
 *       - email: user
 *         description: User's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Successfully deleted
 */
router.delete('/:email', function (req, res) {
    const io = req.app.get('io');

    var email;
    if (req.params.email) {
        email = req.params.email;
    } else {
        res.status(400).send({error: "An error occurred"});
    }

    User.deleteUser(email, function (errors) {

        if (errors) {
            res.status(500).send("Error deleting " + email);
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