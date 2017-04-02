const express = require('express');

module.exports = function (app, passport) {

    const router = express.Router();

    /**
     * LOCAL
     */
    router.get('/local', function(req, res) {
        res.render('connect-local.ejs', { message: req.flash('loginMessage') });
    });
    router.post('/local', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    /**
     * FACEBOOK
     */
    // send to facebook to do the authentication
    router.get('/facebook', passport.authorize('facebook', { scope : 'email' }));

    // handle the callback after facebook has authorized the user
    router.get('/facebook/callback',
        passport.authorize('facebook', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));

    /**
     * GOOGLE
     */
    // send to google to do the authentication
    router.get('/google', passport.authorize('google', { scope : ['profile', 'email'] }));

    // the callback after google has authorized the user
    router.get('/google/callback',
        passport.authorize('google', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));

    return router;

};
