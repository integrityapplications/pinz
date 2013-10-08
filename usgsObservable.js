module.exports.createQuakeObservable=createQuakeObservable;


var parseString = require('xml2js').parseString;


function createQuakeObservable(inputXml) {
	if(inputXml == null) throw new Error("WARN :: Null input XML string!");

	if(inputXml == "") throw new Error("WARN :: Blank input XML string!");

	var resultJson = "";
	parseString(inputXml, function (err, result) {
	    resultJson = result;
	});

	var obs = {};

	obs.id = resultJson.entry.id[0];
	obs.attrs = [];
	obs.t = new Date(resultJson.entry.updated[0]);

	var titleValue = resultJson.entry.title[0];
	var magValue = titleValue.substr(2,3);


	obs.attrs.push( { k : "title" , v : titleValue } );
	obs.attrs.push( { k : "magnitude" , v : magValue } );

	obs.geos = [];
	var geoData = {};

	geoData.id = "Earthquake location";

	var geoPoint = resultJson.entry["georss:point"][0].split(" ");
	var pointGeoJson = {
						"type" : "Point",
						//georss = lat/lon vs geoJson lon/lat
						"coordinates" : [ parseFloat(geoPoint[1]), parseFloat(geoPoint[0]) ]
					};

	geoData.loc = pointGeoJson;

	obs.geos.push(geoData);

}

// createQuakeObservable('<entry><id>urn:earthquake-usgs-gov:nc:72083766</id><title>M 0.5 - 2km WSW of Cobb, California</title><updated>2013-10-08T22:00:34.660Z</updated><link rel="alternate" type="text/html" href="http://earthquake.usgs.gov/earthquakes/eventpage/nc72083766"/><summary type="html"><![CDATA[<p class="quicksummary"><a href="http://earthquake.usgs.gov/earthquakes/eventpage/nc72083766#dyfi" class="mmi-III" title="Did You Feel It? maximum reported intensity (2 reports)">DYFI? - <strong class="roman">III</strong></a></p><dl><dt>Time</dt><dd>2013-10-08 21:33:57 UTC</dd><dd>2013-10-08 14:33:57 -07:00 at epicenter</dd><dt>Location</dt><dd>38.810&deg;N 122.753&deg;W</dd><dt>Depth</dt><dd>1.60 km (0.99 mi)</dd></dl>]]></summary><georss:point>38.8097 -122.7528</georss:point><georss:elev>-1600</georss:elev><category label="Age" term="Past Hour"/><category label="Magnitude" term="Magnitude 0"/></entry>');