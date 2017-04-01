const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const User = mongoose.model('User');

/**
 * @swagger
 * definition:
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
 * /:
 *   get:
 *     tags:
 *       - Users
 *     description: Returns all users
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of users
 *         schema:
 *           $ref: '#/definitions/User'
 */
router.get('/', function(req, res){
    res.send("hello user");
    /*User.find({})
        .then(data => {
            res.status(200).send(data);
        }).fail(res.status(204).send());
        */
});

// POST save a user
/**
 * @swagger
 * /:
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
router.post('/', function(req, res){
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
                res.json({success: 1, description: "User added to the list"});
            }
        })
    })
});

/**
 * @swagger
 * /{name}:
 *   get:
 *     tags:
 *       - Users
 *     description: Returns a single user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: name
 *         description: User's name
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: A single user
 *         schema:
 *           $ref: '#/definitions/User'
 */
router.get('/:name', function(req, res){
    var query = {};
    console.log(req.params);
    if (req.params.name) {
        query.name = req.swagger.params.name.value;
    } else {
        res.status(204).send();
    }

    User.find(query)
        .then(data => {
            if (req.swagger.params.name.value) {
                data = data[0];
            }
            console.log(data);

            res.json(data);
        }).fail(res.status(204).send());
});

/**
 * @swagger
 * /{name}:
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
 *         type: array
 *         $ref: '#/definitions/User'
 *     responses:
 *       200:
 *         description: Successfully updated
 */
router.get('/:name', function(req, res){
    //put
});

/**
 * @swagger
 * /{name}:
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
router.get('/:name', function(req, res){
    //delete
});

//export this router to use in our index.js
module.exports = router;