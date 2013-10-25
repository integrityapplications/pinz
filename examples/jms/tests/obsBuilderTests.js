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
