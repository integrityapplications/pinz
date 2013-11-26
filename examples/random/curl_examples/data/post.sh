#!/bin/bash

if [[ $# -eq 0 ]]; then
	echo "No arguments supplied, filename specifing POST content required"
	echo "Usage: $0 filename"
	exit 1
fi

echo "POSTing contents of $1"
curl -X POST -d  @$1 -H 'content-type:application/json' -H 'Pinz-Debug-Query:true' http://localhost:3000/data