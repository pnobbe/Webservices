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

            if (!req.user) {
                // find a user whose email is the same as the forms email
                // we are checking to see if the user trying to login already exists
                User.findOne({'local.email': email}, function (err, user) {
                    // if there are any errors, return the error
                    if (err)
                        return done(err);

                    // check to see if theres already a user with that email
                    if (user) {
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                    } else {

                        // if there is no user with that email
                        // create the user
                        const newUser = new User();

                        // set the user's local credentials
                        newUser.local.email = email;
                        newUser.local.password = newUser.generateHash(password); // use the generateHash function in our user model

                        // save the user
                        newUser.save(function (err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }

                });
            } else {
                // user already exists and is logged in, we have to link accounts
                var user = req.user; // pull the user out of the session

                // update the current users local credentials
                user.local.email = email;
                user.local.password = user.generateHash(password); // use the generateHash function in our user model

                // save the user
                user.save(function (err) {
                    if (err)
                        throw err;
                    return done(null, user);
                });
            }

        }));

    /**
     * GOOGLE
     */
    passport.use('google', new GoogleStrategy({

            clientID: configAuth.googleAuth.clientID,
            clientSecret: configAuth.googleAuth.clientSecret,
            callbackURL: configAuth.googleAuth.callbackURL,
            passReqToCallback : true
        },
        function (req, token, refreshToken, profile, done) {

            // make the code asynchronous
            // User.findOne won't fire until we have all our data back from Google
            process.nextTick(function () {

                if (!req.user) {
                    // try to find the user based on their google id
                    User.findOne({'google.id': profile.id}, function (err, user) {
                        if (err)
                            return done(err);

                        if (user) {

                            // if there is a user id already but no token (user was linked at one point and then removed)
                            // just add our token and profile information
                            if (!user.facebook.token) {
                                user.google.token = token;
                                user.google.name = profile.displayName;
                                user.google.email = profile.emails[0].value;

                                user.save(function (err) {
                                    if (err)
                                        throw err;
                                    return done(null, user);
                                });
                            }

                            return done(null, user); // user found, return that user
                        } else {
                            // if the user isnt in our database, create a new user
                            const newUser = new User();

                            // set all of the relevant information
                            newUser.google.id = profile.id;
                            newUser.google.token = token;
                            newUser.google.name = profile.displayName;
                            newUser.google.email = profile.emails[0].value; // pull the first emai;
                            newUser.name = profile.displayName;

                            // save the user
                            newUser.save(function (err) {
                                if (err)
                                    throw err;
                                return done(null, newUser);
                            });
                        }
                    });
                } else {
                    // user already exists and is logged in, we have to link accounts
                    var user = req.user; // pull the user out of the session

                    // update the current users google credentials
                    user.google.id = profile.id;
                    user.google.token = token;
                    user.google.name = profile.displayName;
                    user.google.email = profile.emails[0].value; // pull the first emai;

                    // save the user
                    user.save(function (err) {
                        if (err)
                            throw err;
                        return done(null, user);
                    });
                }

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
            passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        },

        // facebook will send back the token and profile
        function (req, token, refreshToken, profile, done) {
            console.dir(profile);
            // asynchronous
            process.nextTick(function() {

                // check if the user is already logged in
                if (!req.user) {

                    User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
                        if (err)
                            return done(err);

                        if (user) {

                            // if there is a user id already but no token (user was linked at one point and then removed)
                            if (!user.facebook.token) {
                                user.facebook.token = token;
                                user.facebook.name  = profile.displayName;
                                user.facebook.email = profile.email;

                                user.save(function(err) {
                                    if (err)
                                        throw err;
                                    return done(null, user);
                                });
                            }

                            return done(null, user); // user found, return that user
                        } else {
                            // if there is no user, create them
                            var newUser            = new User();

                            newUser.facebook.id    = profile.id;
                            newUser.facebook.token = token;
                            newUser.facebook.name  = profile.displayName;
                            newUser.facebook.email = profile.emails;
                            newUser.name = profile.name.givenName + ' ' + profile.name.familyName;

                            newUser.save(function(err) {
                                if (err)
                                    throw err;
                                return done(null, newUser);
                            });
                        }
                    });

                } else {
                    // user already exists and is logged in, we have to link accounts
                    var user            = req.user; // pull the user out of the session

                    user.facebook.id    = profile.id;
                    user.facebook.token = token;
                    user.facebook.name  = profile.displayName;
                    user.facebook.email = profile.email;

                    user.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, user);
                    });

                }
            });

        }));
};