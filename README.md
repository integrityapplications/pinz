pinz
====

Geospatial visualization of near real-time data in a browser.

Pinz provides a data agnostic platform for caching event streams, a robust RESTful web API for data retrieval, and an example client GUI allowing end users to view, filter, and discover disparate data streams from a modern web browser. 

The web is already saturated with web applications that do the same thing, why develop pinz? Most existing solutions are tailored for specific data sources, like twitter. We want a solution that makes it trivial to plug in new data sources without writing a single line of code or restarting the application. **Data source intregration is removed from the application layer and occurs at the data store layer**.

Under the Covers
----------------

Event streams are cached in a single MongoDB database, pinz, as capped collections with one collection per event stream. The collection name will be the name of the event stream. Pinz is intended to handle event streams with millions of events per day. The current mongo architecture may have to be tweaked if write locking becomes a problem (TBD). 

Events are stored as documents called observables. An observable is a generic json document containing data about a single event. 
An observable defines the data source, event time, event id, event location(s), and domain specific key value pair(s). 

Populating MongoDB with observables is outside the scope of pinz and will vary greatly by user needs and available event streams. The `examples` folder contains several datastore population examples.

API Guide
=========

/metadata
---------

The metadata endpoint is accessed via HTTP GET and returns an array of json documents with one document per event stream. Each document describes the event stream and defines all domain specific key value pairs available for that event stream. Each key value pair definition describes the attribute, defines the type (number|string|enumeration), and defines valid ranges for numeric and enumeration types. Pinz’s example GUI uses this endpoint to obtain the data needed to build event filtering menus.

/data
-----

The data endpoint is accessed via HTTP POST and returns an array of observable json documents matching search criteria defined in the post body. A maximum of 5000 documents is returned per event stream. The first iteration will just support AJAX pulling at regulation intervals. Future releases will explore SSE and/or web sockets (TBD).

### Observable Document

We had a difficult time figuring out how to structure our data. One camp wanted a definable schema to enable indexing and documentent understanding.
Another camp wanted a boundless schema to enable client side ease of use and not be limited by a definable schema, "we are using a schemaless database and a schemaless language". In the end, we decided both had merits and are needed.

These two representations can be accessed using the Accept header.  Using the Accept=application/pinz-json value, the following fom for JSON will be returned::

#### Accept header: application/pinz-json - returns documents as stored in MongoDB ###

```
{
  id: 'obsId',
  src: 'obsSource',
  t: Date(),
  attrs: [
    {
      k: 'domainSpecificAttribute1' ,
      v: 'some value'
    },
    {
      k: 'domainSpecificAttribute2' ,
      v: 1 ,
      u: 'MPH'
    }
  ],
  geos: [
    {
      id: 'geolocation id',
      loc: {
        type: 'Point',
        coordinates: [-60, 30]
      }
    }
  ]
}
```


However, if the Accept header is set to Accept=application/json, a more "regular" form of JSON will be returned::

#### Accept header: application/json - Returns documents with attrs k v pairs broken into standard json elements.###

```
{
  id: 'obsId',
  src: 'obsSource',
  t: Date(),
  attrs: {
      domainSpecificAttribute1: {
        v: 'some value'
      },
      domainSpecificAttribute2': {
        v: 1,
        u: 'MPH'
      }
  },
  geos: [
    {
      id: 'geolocation id',
      loc: {
        type: 'Point',
        coordinates: [-60, 30]
      }
    }
  ]
}
```

Note: Even in the transformed documents, attribute data values are objects, capturing the value and the unit data.

### POST contents

[Example POST document](https://raw.github.com/integrityapplications/pinz/master/examples/random/curl_examples/data/postExample.json)

### Required inputs
`src` :	Name of data feed to query

### Optional inputs
`time_inserted`
* start : [ISO8601](http://en.wikipedia.org/wiki/ISO_8601) formated date string defining lower time bound, UTC
* end : [ISO8601](http://en.wikipedia.org/wiki/ISO_8601) formated date string defining upper time bound, UTC

`time_within`
 * start : [ISO8601](http://en.wikipedia.org/wiki/ISO_8601) formated date string defining lower time bound, UTC
 * end : [ISO8601](http://en.wikipedia.org/wiki/ISO_8601) formated date string defining upper time bound, UTC

`geo_within` : Array of latitude, longitude pairs that define a valid closed polygon search area

`attrs` : Array of key:value objects (TBD)

Running a demo
==============

1. Install node dependencies:

  ```
      npm install
  ```

2. start mongo on port 27017:

  ```
	mkdir db
	mongod --dbpath ./db --port 27017 --fork
  ```

3. Run node application examples/random/datagen.js to continously populate MongoDB with randomly generated observables. Verify by viewing generated documents with mongo shell.

  ```
    node examples/random/datagen.js --samplesPerUpdate=10 --updateSec=10
  ```

4. start pinz application:

  ```
    npm start 

    or

    node server.js --mongoUrl=mongodb://localhost:27017/pinz --serverPort=6161
    (to specify non-default settings)
  ```

5. Test installation by running some of the example http commands in examples/random/curl_examples.

6. Use the web client:

  ```
    http://localhost:3000/ngapp/
  ```

Indexing
========
Indexes are a vital part of a properly tuned mongo installation ensuring efficient and timely queries. Below are the recommended indexes and the types of queries they cover. Since every pinz installation will support a unique set of users and needs, not all indexes are needed if only certain types of queries are performed.

MongoDB provides excellent visibility into query performance with `explain`. View `explain` results by setting the custom HTTP header `Pinz-Debug-Query` to true in HTTP requests.

1. Unbounded domain specific attribute queries

  ```
    db.<source>.ensureIndex({"attrs.k":1, "attrs.v":1})
  ```

2. Domain specific attribute queries bounded by time, geospatial, or time and geospatial constraints

3. Geospatial constraints

4. Time constraints

5. Time and geospatial constraints

Copyright and license
==

Copyright 2013 [Integrity Applications Incorporated](http://www.integrity-apps.com) under [the Apache 2.0 license](LICENSE).

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed 
on an "AS IS" BASIS,WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.

By contributing your code, you agree to license your contribution under the Apache 2 license.

