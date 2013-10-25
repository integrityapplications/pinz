JMS Example
====

The JMS Example 

1. Consumes data streams from JMS server. JMS is a Java publish/subcribe messaging middleware protocol.

2. Converts messages into pinz observable documents

3. Inserts the pinz observable documents into MongoDB

The message body expected on the JMS topic is the result of interfacing with a legacy application.
Feel free to use this example with your existing JMS data streams, just replace obsBuiler.js with one that knows how to handle your specific messages.

A little history
----------------
A legacy project normalized disparate data feeds into a common XML format and published the messages onto JMS topics.
The messages were then consumed by a Complex Event Processor (CEP) to alert on standing questions.
This application lacked a good way of viewing the data feeds before sending them into the CEP.
The idea for Pinz materialized as an applicaton to provide situational awareness about the data feeds.


