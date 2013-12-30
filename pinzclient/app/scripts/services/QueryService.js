'use strict';

angular.module('modalApp')
.service('QueryService', function QueryService($http, $log, $rootScope) {

	var qs = {};

	qs.setDataQuery = function(inputQuery) {
		return inputQuery;
	}

	qs.validateQueryForServer = function(inputQuery, dataQuery, dataSources, activeSources) {

		var tempDataQuery = [];
		var srcIdx;

		for(srcIdx = 0; srcIdx < inputQuery.length; srcIdx++) {


			// only add to server query if the source is active
			var sourceIsActive = (activeSources[srcIdx] === 'disabled') ? false : true;


			if(sourceIsActive === true) {

			
				var tempSrcQuery = {};

				var srcQuery = inputQuery[srcIdx];
			
				// gotta have a source name
				tempSrcQuery.src = srcQuery.src;

				// note server-side validation strips a empty array for time_within
				if(("time_within" in srcQuery) && (srcQuery.time_within != null)) {
					if(("start" in srcQuery.time_within) && ("end" in srcQuery.time_within)) {
						// we can have validation on the values in here, for now just leave
						tempSrcQuery.time_within = { start : srcQuery.time_within.start }
					}
				}

				// If geo input exists, set it on each src - hence 'global' name of geo param
				if(("globalGeo" in inputQuery) && (inputQuery.globalGeo != null)) {
					tempSrcQuery.geo_within = inputInfo.globalGeo;	
				}

				// now deal with attributes
				var attrIdx;
				var tempAttrs = [];

				for(attrIdx = 0; attrIdx < srcQuery.attrs.length; attrIdx++) {
					
					var attribute = srcQuery.attrs[attrIdx];

					if(attribute != null) {

						if(("v" in attribute) == true) {

							// if an array with fixed values, assume set by pillbox
							if((attribute.v instanceof Array) == true && ("values" in dataSources[srcIdx].attrs[attrIdx])) {
								// if the dataQuery value isn't blank, add to tempQuery.  If it is blank, just ignore it
								if((dataQuery[srcIdx].attrs[attrIdx].v instanceof Array)
									&& (dataQuery[srcIdx].attrs[attrIdx].v.length > 0)
									&& (dataQuery[srcIdx].attrs[attrIdx].v.length != dataSources[srcIdx].attrs[attrIdx].values.length)
									) {
									// accumulate legit values
									tempAttrs.push({
										"k" : attribute.k,
										"v" : attribute.v
									});

								}

							// if we have just a string, add to array value list
							} else if(typeof attribute.v === 'string' && attribute.v.length > 0) {
								// accumulate legit values
								tempAttrs.push({
										"k" : attribute.k,
										"v" : attribute.v
								});

							}

						// no v, but we might have a number...
						} else if( ("low" in attribute) && ("high" in attribute) ) {

							if(attribute.low != null && attribute.high != null) {
								
								console.log("\tProcessing non-null number attr: " + JSON.stringify(attribute));

								var attrRefLow = dataSources[srcIdx].attrs[attrIdx].low;
								var attrRefHigh = dataSources[srcIdx].attrs[attrIdx].high;

								if ((attrRefLow == null || typeof attrRefLow == 'undefined') && (attrRefHigh == null || typeof attrRefHigh == 'undefined')) {

									tempAttrs.push({
											"k" : attribute.k ,
											"low" : attribute.low ,
											"high" : attribute.high
									});

								} else {

									if( (attribute.low == attrRefLow && attribute.high == attrRefHigh) == false) {
										// include in serverQuery temp object
										tempAttrs.push({
											"k" : attribute.k ,
											"low" : attribute.low ,
											"high" : attribute.high
										});

									}

								}
							}
						}

					}

					// only add attrs if we actually have some values
					if(tempAttrs.length > 0) {
						tempSrcQuery.attrs = tempAttrs;
					}

				}

				tempDataQuery.push(tempSrcQuery);
				
			} else {
				console.log("\tSkipping src_" + srcIdx + " from server query because it is not active according to activeSources[srcIdx] : " + activeSources[srcIdx]);
			}
		}
		return tempDataQuery;
		
	}

	return qs;
});