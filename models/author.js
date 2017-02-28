var mongoose = require('mongoose');
var Book = mongoose.model('Book');

console.log('Iniializing author schema');

var authorSchema = new mongoose.Schema({
	firstname: {type: String, required: true},
	lastname: {type: String, required: true},
	birthdate: {type: Date, required: true, max: new Date(new Date().toDateString())},
	country: {type: String, default: "NL"},
	ranking: {type: Number, min: 0, unique: true},
	books: [ {type: mongoose.Schema.Types.ObjectId, ref: 'Book'} ]
});

authorSchema.set('toJSON', { virtuals: true});
authorSchema.set('toObject', { virtuals: true});

authorSchema.virtual('fullname').get(function () {
    return this.firstname + " " + this.lastname;
});

authorSchema.statics.findByName = function(fn, cb) {
	first = fn.split(" ")[0];
	last = fn.split(" ")[1];

    return this.find({ firstname: {$regex: first, $options: "i"}, lastname: {$regex: last || "", $options: "i"} }, cb);
};

authorSchema.statics.findByCountry = function(cn, cb) {
    return this.find({ country: cn }, cb);
};

var Author = mongoose.model('Author', authorSchema);

/*
TODO: 
- De benodigde extra validation
- De benodigde static methods
- De benodigde instance methods
*/