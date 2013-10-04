pinz
====

Geospatial visualization of near real-time data in a browser.

Pinz provides a data agnostic platform for caching event streams, a robust RESTful web API for data retrieval, and an example client GUI allowing end users to view, filter, and discover disparate data streams from a modern web browser. 

The web is already saturated with web applications that do the same thing, why develop pinz? Most existing solutions are tailored for specific data sources, like twitter. We want a solution that makes it trivial to plug in new data sources without writing a single line of code or restarting the application. **Data source intregration is removed from the application layer and occurs at the data store layer**.

Under the Covers
----------------

Event streams are cached in a single MongoDB database, observabledb, as capped collections with one collection per event stream. The collection name will be the name of the event stream. Pinz is intended to handle event streams with millions of events per day. The current mongo architecture may have to be tweaked if write locking becomes a problem (TBD). 

Events are stored as documents called observables. An observable is a generic json document containing data about a single event. 
An observable defines the data source, event time, event id, event location(s), and domain specific key value pair(s). 

Populating MongoDB with observables is outside the scope of pinz and will vary greatly by user needs and available event streams.

API Guide
=========

/metadata
---------

The metadata endpoint is accessed via HTTP GET and returns an array of json documents with one document per event stream. Each document describes the event stream and defines all domain specific key value pairs available for that event stream. Each key value pair definition describes the attribute, defines the type (number|string|enumeration), and defines valid ranges for numeric and enumeration types. Pinz’s example GUI uses this endpoint to obtain the data needed to build event filtering menus.

/data
-----

The data endpoint is accessed via HTTP POST and returns an array of observable json documents matching search criteria defined in the post body. A maximum of 5000 documents is returned per event stream. The first iteration will just support AJAX pulling at regulation intervals. Future releases will explore SSE and/or web sockets (TBD).

Area search inputs are

`time-within`
 * start : ISODate lower time bound, assumed to be in "zulu" time [(pretty much GMT)](http://en.wikipedia.org/wiki/Coordinated_Universal_Time)
 * end : ISODate upper time bound, assumed to be in "zulu" time (pretty much GMT)

`geo-within` : Array of latitude, longitude pairs that define a valid closed polygon search area

`attrs` : Array of key:value objects (TBD)

`src` :	Name of data feed to query

Running a demo
==============

1. Install node dependencies:

    npm install

2. start mongo on port 27017:

    mkdir db
    mongod --dbpath ./db --port 27017 --fork

3. Run node application resources/datagen.js to continously populate MongoDB with randomly generated observables. Verify by viewing generated documents in 'observabledb' with mongo shell.

datagen.js options:
	--samplesPerUpdate
	--updateSec

    node resources/datagen.js --samplesPerUpdate=10 --updateSec=10

4. start pinz application:

    npm start 

5. Test installation by running resources/testPost.sh. An array of matching observable documents will be output if everything is working properly.

6. Use the web client:

    http://localhost:3000/ngapp/

