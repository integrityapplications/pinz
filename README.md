pinz
====

Geospatial visualization of near real-time data in a browser.

Pinz provides a data agnostic platform for caching event streams, a robust RESTful web API for data retrieval, and an example client GUI allowing end users to view, filter, and discover disparate data streams from a modern web browser. 

Event streams are cached in a single MongoDB database, observabledb, as capped collections with one collection per event stream. The collection name will be the name of the event stream. Pinz is intended to handle event streams with millions of events per day. The current mongo architecture may have to tweaked if write locking becomes a problem (TBD). 

Events are stored as documents we call observables. An observable is a generic json document containing data about a single event. 
An observable defines the data source, event time, event id, event location(s), and domain specific key value pair(s). 

Populating MongoDB with observables is outside the scope of pinz and will vary greatly by user needs and available event streams.

====
API Guide

Area search inputs are

time-within
	|_start	:	ISODate lower time bound, assumed to be in "zule" time (pretty much GMT) http://en.wikipedia.org/wiki/Coordinated_Universal_Time
	|_end	:	ISODate upper time bound, assumed to be in "zulu" time (pretty much GMT)

geo-within	:	Array of latitude, longitude pairs that define a valid closed polygon search area

attrs		: 	Array of key:value objects (TBD)

src			:	Name of data feed to query


