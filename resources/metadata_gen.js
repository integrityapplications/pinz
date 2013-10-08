var mongo = require('mongodb');
// Dont need cmd line args

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

// connect to db, and persist to observabledb.metadata collection
var mongoUrl = "mongodb://127.0.0.1:27017/observabledb";

// mongo.connect(mongoUrl , function(err, db) {

// 	if(err) throw err;
	
// 	console.log("Successfully connected to mongo at " + mongoUrl);
	
// 	db.collection("metadata" , sourceA, function(err, objects) {
// 				if(err) throw err;
// 	});

// 	db.collection("metadata" , sourceB, function(err, objects) {
// 				if(err) throw err;
// 	});

// });


def insertMetadata(db) {

	db.collection("metadata").drop(function(err) {
		db.collection("metadata").insert([sourceA, sourceB] , function(err, objects) {
			if(err):
				console.log("WARN :: Error persisting source object to metadata collection @ " + mongoUrl);
			else:
				console.log("INFO :: Successfully persisted sourceA object to metadata collection @ " + mongoUrl);
		});

	});

}



