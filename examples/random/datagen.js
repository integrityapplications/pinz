var mongo = require('mongodb');
var argv = require('optimist').argv;
var metadata = require('./metadata_gen');

var sources = [
	{
		src: 'A',
		attrRecipes: [
			{
				name: "color",
				range: ["red", "green", "blue", "yellow", "orange", "pink", "black"]
			},
			{
				name: "animal",
				range: ["croc", "koala", "kangaroo", "cockatoo"]
			},
			{
				name: "weight",
				low: 0,
				high: 100,
				units: "kg"
			}
		]
	}, 
	{
		src: 'B',
		attrRecipes: [
			{
				name: "level",
				low: 0,
				high: 1000
			}
		]
	}
]
var samplesPerUpdate = 1000;
var updateSec = 10;
var mongoUrl = "mongodb://127.0.0.1:27017/pinz";

if (argv.updateSec) updateSec = argv.updateSec;
if (argv.samplesPerUpdate) samplesPerUpdate = argv.samplesPerUpdate;
console.log("updateSec: " + updateSec + ", samplesPerUpdate: " + samplesPerUpdate);

mongo.connect(mongoUrl , function(err, db) {
	if(err) throw err;
	
	console.log("Successfully connected to mongo at " + mongoUrl);
	
	metadata.insertMetadataDocs(db);

	setInterval(function() {
		for(var srcIdx = 0; srcIdx < sources.length ; srcIdx++) {
			console.log("Publishing " + samplesPerUpdate + " documents to collection: " + sources[srcIdx].src);
			db.collection(sources[srcIdx].src).insert(generateDocs(sources[srcIdx], samplesPerUpdate) , function(err, objects) {
				if(err) throw err;
			});
		}
		console.log("Waiting for next interval: " + updateSec);
	}, updateSec * 1000);
});

function generateDocs(src, numDocs) {
	var docs = [];
	for(var i=0; i<numDocs; i++) {
		var doc = {
			id: src.src + i,
			src: src.src,
			t: new Date(),
			desc: "autogenerated observable",
			attrs: generateAttrs(src.attrRecipes),
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
	//console.log(JSON.stringify(docs, null, 2));
	return docs;
}

function generateAttrs(attrRecipes) {
	var attrs = [];
	for (var recipeIndex=0; recipeIndex<attrRecipes.length; recipeIndex++) {
		var recipe = attrRecipes[recipeIndex];
		var val = "";
		if ('range' in recipe) {
			val = recipe.range[randomFromInterval(0, recipe.range.length-1)];
		} else if ('low' in recipe || 'high' in recipe) {
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