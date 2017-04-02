const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const User = require('../../models/user');
const configAuth = require("./auth");

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
            process.nextTick(function () {

                //  Whether we're signing up or connecting an account, we'll need
                //  to know if the email address is in use.
                User.findOne({'local.email': email}, function (err, existingUser) {

                    // if there are any errors, return the error
                    if (err)
                        return done(err);

                    // check to see if there's already a user with that email
                    if (existingUser)
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));

                    // create the user
                    var newUser = new User();

                    newUser.local.email = email;
                    newUser.local.password = newUser.generateHash(password);

                    newUser.email = email; // pull the first email;


                    newUser.save(function (err) {
                        if (err)
                            throw err;

                        return done(null, newUser);
                    });
                });
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
            process.nextTick(function () {


                // try to find the user based on their google id
                User.findOne({'google.id': profile.id}, function (err, user) {
                    if (err)
                        return done(err);

                    if (user) {
                        return done(null, user); // user found, return that user
                    } else {

                        // if the user isnt in our database, create a new user
                        const newUser = new User();

                        // set all of the relevant information
                        newUser.google.id = profile.id;
                        newUser.google.token = token;
                        newUser.google.name = profile.displayName;
                        newUser.google.email = profile.emails[0].value; // pull the first email;
                        newUser.name = profile.displayName;
                        newUser.email = profile.emails[0].value; // pull the first email;

                        // save the user
                        newUser.save(function (err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });
            });

        }));

    /**
     * FACEBOOK
     */
    passport.use('facebook', new FacebookStrategy({

            // pull in our app id and secret from our auth.js file
            clientID: configAuth.facebookAuth.clientID,
            clientSecret: configAuth.facebookAuth.clientSecret,
            callbackURL: configAuth.facebookAuth.callbackURL,
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        },

        // facebook will send back the token and profile
        function (req, token, refreshToken, profile, done) {

            // asynchronous
            process.nextTick(function () {

                User.findOne({'facebook.id': profile.id}, function (err, user) {
                    if (err)
                        return done(err);

                    if (user) {
                        return done(null, user); // user found, return that user
                    } else {
                        // if there is no user, create them
                        var newUser = new User();

                        newUser.facebook.id = profile.id;
                        newUser.facebook.token = token;
                        newUser.facebook.name = profile.displayName;
                        newUser.facebook.email = profile.emails;
                        newUser.name = profile.name.givenName + ' ' + profile.name.familyName;

                        newUser.save(function (err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });


            });

        }));
};