const login = require('./login');
const signup = require('./signup');
const User = require('../../models/user');

module.exports = function(passport){

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });


    // Setting up Passport Strategies for Login and SignUp/Registration
    login(passport);
    signup(passport);

}