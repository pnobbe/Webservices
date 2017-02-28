var q = require('q');

var mongoose = require('mongoose');

Book = mongoose.model('Book');
Author = mongoose.model('Author');

book1 = new Book();
book1.title = "The Adventures of Patrick";
book1.publishDate = new Date(2015, 06, 13);
book1.category = "Thriller";
book1.chapters = [{ title: "Chapter 1: Working with Marius", numberOfPages: 23 }, { title: "Chapter 2: Getting a 10", numberOfPages: 17 }];

author1 = new Author();
author1.firstname = "Patrick";
author1.lastname = "Nobbe";
author1.birthdate = new Date(1996, 06, 13);
author1.ranking = 496;
author1.books = [book1];

function fillTestBooks(callback){

	var testData = [
		// Vul hier je testdata voor boeken in
		// {}, {}, {}
		book1
	];

	Book.find({})
		.then(data => {
			// Als er nog geen boeken zijn vullen we de testdata
			if(data.length == 0){
				console.log('Creating books testdata');

				testData.forEach(function(book){
					book.save();
				});
			} else{
				console.log('Skipped creating book testdata, data is already present');
			}
		});
};

function fillTestAuthors(){

	var testData = [
		// Vul hier je testdata voor authors in
		// {}, {}, {}
		author1
	];

	Author.find({}).then(data => {
		// Als er nog geen author zijn vullen we de testdata
		if(data.length == 0){
			console.log('Creating authors testdata');

			testData.forEach(function(author){
				author.save();
			});
		} else{
			console.log('Skipped creating author testdata, data is already present');
		}
	});
};

module.exports = function(){
	q.fcall(fillTestBooks).then(fillTestAuthors);
}