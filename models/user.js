var mongoose = require('mongoose');

console.log('Iniializing user schema');

var userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true},
    password: String, // not required as secrets can be used aswell.
    role: {type: [String], default: ["user"]},
    secrets: [String]
});

userSchema.set('toJSON', {virtuals: true});
userSchema.set('toObject', {virtuals: true});


userSchema.virtual('isAdmin').get(function () {
    return this.role.includes("admin");
});

userSchema.statics.findByName = function (name, cb) {
    return this.find({name: {$regex: name, $options: "i"}}, cb);
};

userSchema.statics.findByRole = function (inputRole, cb) {
    return this.find({role: inputRole}, cb);
};

var user = mongoose.model('User', userSchema);
