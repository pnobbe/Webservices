var mongoose = require('mongoose');

console.log('Iniializing books schema');

var bookSchema = new mongoose.Schema({
	title: {type: String, required: true},
	publishDate: {type: Date, required: true, max: new Date(new Date().toDateString())},
	category: {type: String, required: true},
	chapters: [{
		title: { type: String },
		numberOfPages: { type: Number }
	}]
});

bookSchema.set('toJSON', { virtuals: true });
bookSchema.set('toObject', { virtuals: true });

bookSchema.virtual('totalNumberOfPages').get(function () {
	var total = 0;
	this.chapters.forEach( function (obj)
	{
		total += obj.numberOfPages;
	});
	return total;
});

bookSchema.statics.findByCategory = function(category, cb) {
	return this.find({ category: new RegExp(category, 'i')}, cb);
};

var Book = mongoose.model('Book', bookSchema);

/*
TODO: 
- De benodigde virtuals (Onder andere totalNumberOfPages, opgebouwd uit numberOfPages van chapters)
- De benodigde extra validation
- De benodigde static methods
- De benodigde instance methods
*/