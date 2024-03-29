module.exports = function (app, passport) {


    // HOW TO USE API:
    //var Places = require('../service/places');
    //var place = new Places();
    //place.getNearbyLocationsbyCity("Den Bosch, Netherlands").then(data => {
    //console.log(data);
    //});


    /**
     * HOME PAGE
     */
    app.get('/', function (req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });


    /**
     * LOGIN
     */
    // show the login form
    app.get('/login', function (req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', {message: req.flash('loginMessage')});
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    /**
     * SIGNUP
     */
    // show the signup form
    app.get('/signup', function (req, res) {
        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', {message: req.flash('signupMessage')});
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/signup', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    /**
     * API
     */
    app.use('/api', require('./api')(app.get('user')));

    /**
     * AUTHENTICATE (FIRST LOGIN)
     */
    app.use('/auth', require('./auth')(passport));

    /**
     * PROFILE
     */
    // We will want this protected so you have to be logged in to visit
    // We will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', app.get('user').can('access profile page'), function (req, res) {
        res.render('profile.ejs', {
            user: req.user,// get the user out of session and pass to template
        });
    });

    /**
     * ADMIN PAGE
     */
    app.get('/admin', app.get('user').is('admin'), function (req, res) {
        res.render('admin.ejs'); // load the index.ejs file
    });

    /**
     * LOGOUT
     */
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}