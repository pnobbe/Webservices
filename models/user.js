const mongoose = require('mongoose');
const bcrypt   = require('bcrypt-nodejs');


console.log('Creating user schema');

const userSchema = new mongoose.Schema({
    name: {type: String},
    local            : {
        email        : String,
        password     : String,
    },
    facebook         : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    twitter          : {
        id           : String,
        token        : String,
        displayName  : String,
        username     : String
    },
    google           : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    role: {type: [String], default: ["user"]},
});

userSchema.set('toJSON', {virtuals: true});
userSchema.set('toObject', {virtuals: true});

// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

userSchema.virtual('isAdmin').get(function () {
    return this.role.includes("admin");
});

userSchema.statics.findByUsername = function (username, cb) {
    return this.find({name: {$regex: username, $options: "i"}}, cb);
};

userSchema.statics.findByName = function (name, cb) {
    return this.find({name: {$regex: name, $options: "i"}}, cb);
};

userSchema.statics.findByRole = function (inputRole, cb) {
    return this.find({role: inputRole}, cb);
};

module.exports = mongoose.model('User', userSchema);
