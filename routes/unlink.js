const express = require('express');

module.exports = function (app, passport) {

    const router = express.Router();

    /**
     * LOCAL
     */
    router.get('/local', function (req, res) {
        var user = req.user;
        user.local.email = undefined;
        user.local.password = undefined;
        user.save(function (err) {
            res.redirect('/profile');
        });
    });

    /**
     * FACEBOOK
     */
    router.get('/facebook', function (req, res) {
        var user = req.user;
        user.facebook.token = undefined;
        user.save(function (err) {
            res.redirect('/profile');
        });
    });


    /**
     * GOOGLE
     */
    router.get('/google', function (req, res) {
        var user = req.user;
        user.google.token = undefined;
        user.save(function (err) {
            res.redirect('/profile');
        });
    });

    return router;

};
