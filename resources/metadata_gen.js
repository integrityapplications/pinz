var mongo = require('mongodb');

var sourceA = {

	_id : "A" ,

	desc : "Human readable data definition for source A - what it is, where it comes from, kind of info it contains.",

	attrs : [

		{
			name : "color" ,
			type : "string" ,
			desc : "Property to describe the physical color of the A observable." ,
			values : [ "red" , "green" , "blue" , "white" , "brown"]

		} ,

		{
			name : "animal" ,
			type : "string" ,
			desc : "The type of animal in the observable." ,
			values : [ "croc" , "koala" , "kangaroo" , "cockatoo"]

		} ,

		{
			name : "weight",
			type : "number",
			desc : "The mass of the animal in the observable.",
			low : 0,
			high : 100,
			units : "kg"
		}
	]
}

var sourceB = {

	_id : "B" ,

	desc : "Human readable data definition for source B - what it is, where it comes from, kind of info it contains.",

	attrs : [

		{
			name : "level" ,
			type : "number" ,
			desc : "Property to describe the level of the observable",
			low : 0,
			high : 1000

		}
	]

};

function insertMetadataDocs(db) {

	db.collection("metadata").drop(function() {
		db.collection("metadata").insert([sourceA, sourceB] , function(err, objects) {
			if(err) {
				console.log("WARN :: Error persisting metadata documents");
			} else {
				console.log("INFO :: Successfully persisted metadata documents");
			}
		});

	});

}

module.exports.insertMetadataDocs=insertMetadataDocs;