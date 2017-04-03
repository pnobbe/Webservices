const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const configAuth = require("./auth");
const User = require('../../models/user');

module.exports = function (passport) {


    /**
     * LOCAL
     */
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'
    passport.use('local-signup', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },
        function (req, email, password, done) {

            // asynchronous
            process.nextTick(() => {
                User.createNewLocal(req.body, (err, user, info) => {
                    if (info) {
                        done(err, user, req.flash('signupMessage', info));
                    }
                    else {
                        done(err, user);
                    }

                })
            });
        }));

    /**
     * GOOGLE
     */
    passport.use('google', new GoogleStrategy({

            clientID: configAuth.googleAuth.clientID,
            clientSecret: configAuth.googleAuth.clientSecret,
            callbackURL: configAuth.googleAuth.callbackURL,
            passReqToCallback: true
        },
        function (req, token, refreshToken, profile, done) {

            // make the code asynchronous
            // User.findOne won't fire until we have all our data back from Google
            process.nextTick(() => {
                User.createNewGoogle(token, profile, done);
            });

        }));

    /**
     * FACEBOOK
     */
    passport.use('facebook', new FacebookStrategy({
            profileFields: ['id', 'emails', 'name'],
            // pull in our app id and secret from our auth.js file
            clientID: configAuth.facebookAuth.clientID,
            clientSecret: configAuth.facebookAuth.clientSecret,
            callbackURL: configAuth.facebookAuth.callbackURL,
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        },

        // facebook will send back the token and profile
        function (req, token, refreshToken, profile, done) {

            // asynchronous
            process.nextTick(() => {
                User.createNewFaceboo(token, profile, done);
            });

        }));
};