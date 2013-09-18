pinz
====

Geospatial visualisation of near real-time data in a browser.

API Guide
=========

Area search inputs are

`time-within`
 * start : ISODate lower time bound, assumed to be in "zulu" time [(pretty much GMT)](http://en.wikipedia.org/wiki/Coordinated_Universal_Time)
 * end : ISODate upper time bound, assumed to be in "zulu" time (pretty much GMT)

`geo-within` : Array of latitude, longitude pairs that define a valid closed polygon search area

`attrs` : Array of key:value objects (TBD)

`src` :	Name of data feed to query


