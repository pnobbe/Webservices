const express = require('express');

module.exports = function (app, passport) {

    const router = express.Router();

    /**
     * GOOGLE
     */
    // send to google to do the authentication
    // profile gets us their basic information including their name
    // email gets their emails
    router.get('/google', passport.authenticate('google', {scope: ['profile', 'email']}));

    // the callback after google has authenticated the user
    router.get('/google/callback',
        passport.authenticate('google', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));

    /**
     * FACEBOOK
     */
    // route for facebook authentication and login
    router.get('/facebook', passport.authenticate('facebook', { scope : ['email']}));

    // handle the callback after facebook has authenticated the user
    router.get('/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));

    return router;
};
