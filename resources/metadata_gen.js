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

var sourceEarthquake = {

	_id : "earthquake" ,

	desc : "Global earthquake event data from USGS feeds @ http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.atom" ,

	attrs : [
		{
			name : "magnitude" ,
			type : "number" ,
			desc : "The magnitude of the earthquake, as measured on the Richter scale" ,
			low : 0 ,
			units : "Ml"
		} , 
		{
			name : "title" ,
			type : "string",
			desc: "The title of the earthquake event, as given by USGS"
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