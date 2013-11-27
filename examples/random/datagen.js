var mongo = require('mongodb');
var argv = require('optimist').argv;
var async = require('async');

var animalDef = {
	_id : "animal" ,
	desc : "The animal data source defines animal observables. Data is randomly generated by a seperate node.js process.",
	attrs : [
		{
			name : "color" ,
			type : "string" ,
			desc : "Property to describe the physical color of the animal." ,
			values : [ "red" , "green" , "blue" , "white" , "brown"]
		} ,
		{
			name : "animal" ,
			type : "string" ,
			desc : "The type of animal." ,
			values : [ "croc" , "koala" , "kangaroo" , "cockatoo"]
		} ,
		{
			name : "weight",
			type : "number",
			desc : "The mass of the animal.",
			low : 0,
			high : 100,
			units : "kg"
		}
	]
}

var tempDef = {
	_id : "tempature_reading" ,
	desc : "The tempature_reading data source defines global tempature readings. Data is randomly gnerated by a seperate node.js process.",
	attrs : [
		{
			name : "tempature" ,
			type : "number" ,
			desc : "Property to describe the tempature of the observable",
			low : 0,
			high : 120
		}
	]
};

var sources = [animalDef, tempDef];

var samplesPerUpdate = 100;
var updateSec = 10;
var mongoUrl = "mongodb://localhost:27017/pinz";

if (argv.updateSec) updateSec = argv.updateSec;
if (argv.samplesPerUpdate) samplesPerUpdate = argv.samplesPerUpdate;
console.log("updateSec: " + updateSec + ", samplesPerUpdate: " + samplesPerUpdate);

mongo.connect(mongoUrl , function(err, db) {
	if(err) throw err;
	
	console.log("Successfully connected to mongo at " + mongoUrl);
	
	insertMetadataDocs(db);

	setInterval(function() {
		for(var srcIdx = 0; srcIdx < sources.length ; srcIdx++) {
			console.log("Publishing " + samplesPerUpdate + " documents to collection: " + sources[srcIdx]._id);
			db.collection(sources[srcIdx]._id).insert(generateDocs(sources[srcIdx], samplesPerUpdate) , function(err, objects) {
				if(err) throw err;
			});
		}
		console.log("Waiting for next interval: " + updateSec);
	}, updateSec * 1000);
});

function generateDocs(src, numDocs) {
	var docs = [];
	for(var i=0; i<numDocs; i++) {
		var now = new Date();
		var doc = {
			id: now.getTime(),
			src: src._id,
			t: new Date(),
			desc: "autogenerated observable",
			attrs: generateAttrs(src.attrs),
			geos: [
				{
					id: "location",
					loc: {
						type: "Point",
						coordinates : getCoordinates() 
					}
				}
			]
		};
		docs.push(doc);
	}
	return docs;
}

function generateAttrs(attrRecipes) {
	var attrs = [];
	for (var recipeIndex=0; recipeIndex<attrRecipes.length; recipeIndex++) {
		var recipe = attrRecipes[recipeIndex];
		var val = "";
		if ('values' in recipe) {
			val = recipe.values[randomFromInterval(0, recipe.values.length-1)];
		} else if ('low' in recipe && 'high' in recipe) {
			val = randomFromInterval(recipe.low, recipe.high) 
		}
		var attr = {
			k: recipe.name,
			v: val
		}
		if ('units' in recipe) attr.u = recipe.units;
		attrs.push(attr);
	}
	return attrs;
}

//stackoverflow.com/questions/4959975/generate-random-value-between-two-numbers-in-javascript
function randomFromInterval(from, to) {
	var random = Math.floor(Math.random()*(to-from+1)+from);
	//console.log("from: " + from + ", to: " + to + ", random: " + random);
	return random;
}

function getCoordinates() {
	var coor = []; //lon, lat geojson
	coor[0] = randomFromInterval(-179.9, 179.9);
	coor[1] = randomFromInterval(-89.9, 89.9);
	return coor;
}

function insertMetadataDocs(db) {
	async.forEach(sources, function(doc, callback) {
		console.log("Inserting metadata document for source: " + doc._id);
		db.collection("metadata").update({_id:doc._id}, doc, {upsert: true}, function(err, objects) {
			if(err) {
				console.log("WARN :: Error persisting metadata documents");
			}
			callback();
		});
	}, function(err) {
		
	});
}
