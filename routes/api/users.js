const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const User = mongoose.model('User');

/**
 * @swagger
 * definitions:
 *   User:
 *     properties:
 *       name:
 *         type: string
 *       email:
 *         type: string
 *       password:
 *         type: string
 */

/**
 * @swagger
 * /api/users/:
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
    res.format({
        json: function () {
            res.send({message: 'Hello user'});
        },
        html: function () {
            res.send('<h1>Hello user</h1>');
        }
    });
    /*User.find({})
     .then(data => {
     res.status(200).send(data);
     }).fail(res.status(204).send());
     */
});

// POST save a user
/**
 * @swagger
 * /api/users/:
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
 *         description: User
 */
router.post('/', function (req, res) {
    var user1 = new User();
    user1.name = req.body.name;
    user1.email = req.body.email;

    user1.save(function (err) {
        if (err) {
            res.json({success: 0, description: err.message})
        }
        ;
        res.format({
            'text/html': function () {
                return res.status(200).send('<html><body><h1>Success</h1></body></html>');
            },

            'application/json': function () {
                res.status(200).send(user1);
            }
        })
    })
});

/**
 * @swagger
 * /api/users/:email:
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
    var email;
    if (req.params.email) {
        email = req.params.email;
    } else {
        res.status(204).send();
    }

    User.findByEmail(email, function (errors, data) {

        if (errors) {
            res.status(500).send("An error occurred.");
        }

        let user = data[0];
        res.format({
            json: function () {
                console.log("json");
                if (user) {
                    res.status(200).send(user);
                } else {
                    res.status(404).send({message: "No user found with that email. "});
                }
            }.bind(res),
            html: function () {
                console.log("html");
                if (user) {
                    res.status(200).send('<h1>' + user.name + '</h1>');
                } else {
                    res.status(404).send('<strong>No user found with that email. </strong>');
                }
            }
        });
    });


});

/**
 * @swagger
 * /api/users/:name:
 *   put:
 *     tags:
 *      - Users
 *     description: Updates a single user
 *     produces: application/json
 *     parameters:
 *       name: user
 *       in: body
 *       description: Fields for the User resource
 *       schema:
 *         type: object
 *         $ref: '#/definitions/User'
 *     responses:
 *       200:
 *         description: Successfully updated
 */
router.put('/:name', function (req, res) {
    var name;
    if (req.params.name || req.body) {
        name = req.params.name;
    } else {
        res.status(204).send();
    }

    User.findByName(name, function (errors, data) {

        if (errors) {
            res.status(500).send("An error occurred.");
        }

        let user = data[0];
        res.format({
            json: function () {
                console.log("json");
                if (user) {
                    res.status(200).send("Successfully updated.");
                } else {
                    res.status(404).send({message: "No user found with that name. "});
                }
            }.bind(res),
            html: function () {
                console.log("html");
                if (user) {
                    res.status(200).send('<h1> Successfully updated. </h1>');
                } else {
                    res.status(404).send('<strong> No user found with that name. </strong>');
                }
            }
        });
    });
});

/**
 * @swagger
 * /api/users/:name:
 *   delete:
 *     tags:
 *       - Users
 *     description: Deletes a single user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: name
 *         description: User's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Successfully deleted
 */
router.delete('/:name', function (req, res) {
    //delete
});

//export this router to use in our index.js
module.exports = router;