const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

console.log('Creating user schema');

const userSchema = new mongoose.Schema({

    name: {type: String, required: true},
    email: {type: String, required: true, index: true},
    local: {
        name: String,
        email: String,
        password: String,
    },
    facebook: {
        id: String,
        token: String,
        email: String,
        name: String
    },
    twitter: {
        id: String,
        token: String,
        displayName: String,
        username: String
    },
    google: {
        id: String,
        token: String,
        email: String,
        name: String
    },
    role: {type: [String], default: ["user"]},
});

userSchema.set('toJSON', {virtuals: true});
userSchema.set('toObject', {virtuals: true});

// generating a hash
userSchema.static.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.local.password);
};

userSchema.statics.createNewLocal = function (body, done) {

    if(!body.email || !body.name || !body.password)
    {
        return done(null, false, "Missing input data.");
    }

//  Whether we're signing up or connecting an account, we'll need
    //  to know if the email address is in use.
    this.findOne({'local.email': body.email}, function (err, existingUser) {

        // if there are any errors, return the error
        if (err)
            return done(err);

        // return info without creating user
        if (existingUser)
            return done(null, false, "That email is already taken.");

        // create the user
        let newUser = new (mongoose.model('User', userSchema))();

        newUser.local.name = body.name;
        newUser.local.email = body.email;
        newUser.local.password = newUser.generateHash(body.password);

        newUser.name = body.name;
        newUser.email = body.email; // pull the first email;

        newUser.save(function (err) {
            if (err)
                throw err;

            return done(null, newUser);
        });
    });
};

userSchema.statics.createNewGoogle = function (token, profile, done) {
// try to find the user based on their google id
    this.findOne({'google.id': profile.id}, function (err, user) {
        if (err)
            return done(err);

        if (user) {
            return done(null, user); // user found, return that user
        } else {

            // if the user isnt in our database, create a new user
            let newUser = new (mongoose.model('User', userSchema))();

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
};

userSchema.statics.createNewFacebook = function (token, profile, done) {
    this.findOne({'facebook.id': profile.id}, function (err, user) {
        if (err)
            return done(err);

        if (user) {
            return done(null, user); // user found, return that user
        } else {
            // if there is no user, create them
            let newUser = new (mongoose.model('User', userSchema))();

            console.log(profile);

            newUser.facebook.id = profile.id;
            newUser.facebook.token = token;
            newUser.facebook.name = profile.name.givenName + " " + profile.name.familyName;
            newUser.facebook.email = profile.emails[0].value;
            newUser.name = profile.name.givenName + " " + profile.name.familyName;
            newUser.email = profile.emails[0].value;

            newUser.save(function (err) {
                if (err)
                    throw err;
                return done(null, newUser);
            });
        }
    });
}

userSchema.virtual('isAdmin').get(function () {
    return this.role.includes("admin");
});

userSchema.statics.findByName = function (name, cb) {
    return this.find({name: {$regex: name, $options: "i"}}).exec(cb);
};

userSchema.statics.findByEmail = function (email, cb) {
    return this.find({email: {$regex: email + "$", $options: "i"}}).exec(cb);
};

userSchema.statics.findByRole = function (inputRole, cb) {
    return this.find({role: inputRole}).exec(cb);
};

module.exports = mongoose.model('User', userSchema);
