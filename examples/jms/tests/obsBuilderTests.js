var assert = require('assert');
var obsBuilder = require('./../obsBuilder');
var xml2js = require('xml2js');

describe( 'obsBuilder.buildObs', function() {
	var input = null;
	var xml = '<observable xmlns:ns="http://www.georss.org/georss/11">\
<id>myId</id>\
<source>mySource</source>\
<timestamp>2013-10-25T00:00:00.000Z</timestamp>\
<attributes>\
<attribute><key>myAttr1</key><value>myValue1</value></attribute>\
<attribute><key>myAttr2</key><value>1</value></attribute>\
</attributes>\
<geos><geo><id>location</id><ns:point>30 -60</ns:point></geo></goes>\
</observable>';

	before(function(done) {
		xml2js.parseString(xml, obsBuilder.xml2jsOptions, function(error, result) {
			if (error) {
				assert.fail('Unable to parse xml, error: ' + error);
				done();
			} else {
				input = result;
				//console.log(JSON.stringify(input, null, ' '));
				done();
			}
		});
	});

	it("build observable", function() {
		var doc = obsBuilder.constructObs(input);
		//console.log(JSON.stringify(doc, null, ' '));
		assert.equal(doc.id, 'myId');
		assert.equal(doc.src, 'mySource');
		assert.equal(typeof doc.t, 'object');
		assert.equal(doc.t.toISOString(), '2013-10-25T00:00:00.000Z');
		assert.equal(doc.attrs.length, 2);
		assert.equal(doc.geos.length, 1);
	});
});

describe( 'obsBuilder.buildAttrs', function() {
	it("numeric (float) value", function() {
		var attributes = [
			{
				key: 'myFloatAttribute',
				value: '3.14'
			}
		];
		var attrs = obsBuilder.buildAttrs(attributes);
		assert.equal(attrs.length, 1);
		assert.equal(attrs[0].k, 'myFloatAttribute');
		assertNumber(attrs[0].v, 3.14);
	});

	it("numeric (int) value", function() {
		var attributes = [
			{
				key: 'myIntAttribute',
				value: '1'
			}
		];
		var attrs = obsBuilder.buildAttrs(attributes);
		assert.equal(attrs.length, 1);
		assert.equal(attrs[0].k, 'myIntAttribute');
		assertNumber(attrs[0].v, 1);
	});

	it("string value with units", function() {
		var attributes = [
			{
				key: 'attr1',
				value: 'value1',
				units: 'mpg'
			}
		];
		var attrs = obsBuilder.buildAttrs(attributes);
		assert.equal(attrs.length, 1);
		assert.equal(attrs[0].k, 'attr1');
		assert.equal(attrs[0].v, 'value1');
		assert.equal(attrs[0].u, 'mpg');
	});

	it("value with commas", function() {
		var attributes = [
			{
				key: 'attr1',
				value: 'value1,value2,value3'
			}
		];
		var attrs = obsBuilder.buildAttrs(attributes);
		assert.equal(attrs.length, 1);
		assert.equal(attrs[0].k, 'attr1');
		assert.equal(attrs[0].v.length, 3);
		assert.equal(attrs[0].v[0], 'value1');
	});
});

describe( 'obsBuilder.buildGeos', function() {
	it("ellipse", function() {
		var geolocations = {
			id: "location",
			ellipse: "30 -60 1000 500 90"
		};
		var geos = obsBuilder.buildGeos(geolocations);
		assert.equal(geos.length, 1);
		assert.equal(geos[0].id, 'location');
		assert.equal(geos[0].loc.type, 'Point');
		assertNumber(geos[0].loc.coordinates[0], -60);
		assertNumber(geos[0].loc.coordinates[1], 30);
		assertNumber(geos[0].loc.properties.semiMajor, 1000);
		assertNumber(geos[0].loc.properties.semiMinor, 500);
		assertNumber(geos[0].loc.properties.angle, 90);
	});

	it("point", function() {
		var geolocations = {
			id: "location",
			"ns:point": "30 -60"
		};
		var geos = obsBuilder.buildGeos(geolocations);
		assert.equal(geos.length, 1);
		assert.equal(geos[0].id, 'location');
		assert.equal(geos[0].loc.type, 'Point');
		assertNumber(geos[0].loc.coordinates[0], -60);
		assertNumber(geos[0].loc.coordinates[1], 30);
	});

	it("polygon", function() {
		var geolocations = {
			id: "location",
			"ns:polygon": "30 -60 30 -55 25 -55 25 -60 30 -60"
		};
		var geos = obsBuilder.buildGeos(geolocations);
		assert.equal(geos.length, 1);
		assert.equal(geos[0].id, 'location');
		assert.equal(geos[0].loc.type, 'Polygon');
		assert.equal(geos[0].loc.coordinates[0].length, 5);
		assertNumber(geos[0].loc.coordinates[0][0][0], -60);
		assertNumber(geos[0].loc.coordinates[0][0][1], 30);
	});
});

function assertNumber(provided, expected) {
	assert.equal(typeof provided, 'number');
	assert.equal(provided, expected);
}


