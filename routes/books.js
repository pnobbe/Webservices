var express = require('express');
var router = express();
var _ = require('underscore');
var handleError;
var async = require('async');

var mongoose = require('mongoose');
Author = mongoose.model('Author');
Book = mongoose.model('Book');

/*
	TODO:
	- QueryString filter: topCategories={nummer}
		Tel alle boeken in een categorie
		Order deze categorie van meeste naar minste boeken
		Geef alleen de boeken terug die in de top {nummer} categorieën voorkomen
		(For now: Een boek kan maar 1 categorie hebben)

	// Ten slotte, een moeilijkere (door Async methodes)
	- Population: Vul alle autors van het boek
*/
function getBooks(req, res){
	var query = {};
	if(req.params.id){
		query._id = req.params.id.toLowerCase();
	}

	Book.find(query)
		.then(data => {
			if(req.params.id){
				data = data;
			}

    res.json(data);
		}).fail(err => handleError(req, res, 500, err));
}

function getBooksByCategory(req, res){
    var query = {};
    if(req.params.category){
        query.category = req.params.category;
    }

    Book.find(query)
        .then(data => {
        if(req.params.category){
        data = data;
    }

    res.json(data);
}).fail(err => handleError(req, res, 500, err));
}

// Routing
router.route('/')
	.get(getBooks);

router.route('/:id')
	.get(getBooks);

router.route('/category/:category')
    .get(getBooksByCategory);

// Export
module.exports = function (errCallback){
	console.log('Initializing books routing module');
	handleError = errCallback;
	return router;
};