var xml2js = require('xml2js');

var xml2jsOptions = {
	explicitArray: false,
	normalizeTags: true,
	trim: true,
	strict: false
};

function buildObs(body, headers, callback) {
	xml2js.parseString(body, xml2jsOptions, function(error, result) {
		if (error) {
			callback("Unable to parse JMS msg body as XML, Error: " + error);
		} else {
			var doc = null;
			try {
				doc = constructObs(result);
			} catch (exception) {
				callback("Unable to convert XML document, Error: " +  exception);
				return;
			}
			callback(null, doc);
		}
	});
}

function constructObs(result) {
	return {
		id: result.observable.id,
		src: result.observable.source,
		t: new Date(Date.parse(result.observable.timestamp)),
		attrs: buildAttrs(result.observable.attributes.attribute),
		geos: buildGeos(result.observable.geos.geo)
	}
}

function buildAttrs(attributes) {
	var attrs = [];
	attributes.forEach(function(attribute, index) {
		var value = String(attribute.value);
		if (-1 !== value.indexOf(',')) {
			var values = [];
			value.split(',').forEach(function(v, index) {
				values.push(v);
			});
			value = values;
		} else if (isNumeric(value)) {
			value = +value;
		}
		var attr = {
			k: attribute.key,
			v: value
		};
		if ('units' in attribute) attr.u = attribute.units;
		attrs.push(attr);
	});
	return attrs;
}

function buildGeos(geolocations) {
	if (!(geolocations instanceof Array)) {
		geolocations = [geolocations];
	}

	var geos = [];
	geolocations.forEach(function(geolocation, index) {
		var geo = {
			id: geolocation.id
		}
		if ('ellipse' in geolocation) {
			//center lat(WGS84), center lon(WGS84), semiMajor(meters), semiMinor(meters), orientation(degress from North of semiMajor)
			var ellipse = geolocation.ellipse.split(' ');
			geo.loc = {
				type: 'Point',
				coordinates: [+ellipse[1], +ellipse[0]],
				properties: {
					semiMajor: +ellipse[2], //meters
					semiMinor: +ellipse[3], //meters
					angle: +ellipse[4] //degrees
				}
			};
		} else if ('ns:point' in geolocation) {
			//center lat(WGS84), center lon(WGS84)
			var point = geolocation['ns:point'].split(' ');
			geo.loc = {
				type: "Point",
				coordinates: [+point[1], +point[0]]
			};
		} else if ('ns:polygon' in geolocation) {
			//closed ring list of lat/lon pairs
			var polygon = geolocation['ns:polygon'].split(' ');
			var externalRing = [];
			for (var i=0; i<polygon.length; i=i+2) {
				var lat = +polygon[i];
				var lon = +polygon[i+1];
				externalRing.push([lon, lat]);
			}
			geo.loc = {
				type: "Polygon",
				coordinates: [externalRing]
			};
		} else {
			throw new Error("Geolocaiton does not contain expected geography type");
		}
		geos.push(geo);
	});
	return geos;
}

function isNumeric(value) {
	return !isNaN(value);
}

exports.buildAttrs=buildAttrs;
exports.buildGeos=buildGeos;
exports.buildObs=buildObs;
exports.constructObs=constructObs;
exports.xml2jsOptions=xml2jsOptions;
