const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const User = mongoose.model('User');
const Regex = require('../../service/regex');

/**
 * @swagger
 * definitions:
 *   User:
 *     properties:
 *      _id:
 *          type: string
 *      email:
 *         type: string
 *      name:
 *         type: string
 *      isAdmin:
 *          type: boolean
 *     required:
 *      - email
 *      - name
 *
 */

/**
 * @swagger
 * definitions:
 *   UserCreate:
 *     properties:
 *      email:
 *         type: string
 *      name:
 *         type: string
 *      password:
 *          type: string
 *     required:
 *      - email
 *      - name
 *      - password
 *
 */

/**
 * @swagger
 * /users/all/{page}/{limit}:
 *   get:
 *     tags:
 *       - Users
 *     description: Returns all users. (Authorization required)
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
 *       "200":
 *         description: An array of users
 *         schema:
 *         type: object
 *         properties:
 *           result:
 *             type: array
 *             items:
 *               $ref: '#/definitions/User'
 *             required: true
 *           page:
 *             type: number
 *             required: true
 *           limit:
 *             type: number
 *             required: true
 *           notice:
 *             type: string
 */
router.get('/all/:page?/:limit?', function (req, res, next) {
    const io = req.app.get('io');

    // Pagination
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
    var allowed = ["email", "name"];
    var queries = {};
    for (var k in req.query) {
        if (req.query.hasOwnProperty(k) && allowed.includes(k)) {
            queries[k.toString()] = {$regex: Regex.parse(req.query[k]), $options: "i"}
        }
    }


    // execute
    User.find(queries, function (errors, data) {

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
                        result: data.map(User.printJSON)
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
                        resp += User.printHTML(data);
                    });
                    resp += "</div>";
                    res.status(200).send(resp);
                }
            });
        }
    }).skip(offset).limit(limit);

})
;
/**
 * @swagger
 * /users/:
 *   post:
 *     tags:
 *       - Users
 *     description: Creates a new local user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Local User
 *         description: User Creation object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/UserCreate'
 *     responses:
 *       200:
 *         description: Successfully created
 *       400:
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

            io.emit('new_user', user);

            res.format({
                html: function () {
                    res.status(200).send('<p>User has been created successfully.</p>');
                },

                json: function () {
                    res.status(200).send({message: "User has been created successfully.", user: User.printJSON(user)});
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
 *     produces:
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
        return;
    }

    User.findByEmail(email, function (errors, data) {

        if (errors) {
            res.status(400).send({error: "An error occurred."});
            return;
        }

        let user = data[0];
        res.format({
            json: function () {
                if (user) {
                    res.status(200).send(User.printJSON(user));
                } else {
                    res.status(400).send({error: "No user found with that email."});
                }
            },
            html: function () {
                if (user) {
                    res.status(200).send(User.printHTML(user));
                } else {
                    res.status(400).send('<strong>No user found with that email.</strong>');
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
        return;
    }
    // Call User.update
    User.updateUser(email, req.body, function (message, success) {

        if (!success) {
            res.status(400).send({error: message});
        }
        else {
            io.emit('update_user', success);

            res.format({
                html: function () {
                    res.status(200).send(User.printHTML(success));
                },
                json: function () {
                    res.status(200).send(User.printJSON(success));
                }
            })
        }
    });
});

/**
 * @swagger
 * /users/:email:
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
        return;
    }

    User.deleteUser(email, function (errors) {

        if (errors) {
            res.status(400).send("Error deleting " + email);
        }
        else {
            io.emit('delete_user', email);

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

//export this router to use in our index.js
module.exports = router;