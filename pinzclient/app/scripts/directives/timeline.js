'use strict';

angular.module('modalApp').directive('pinzTimeline' , function() {
	return {
		restrict: 'A',
		scope: {
              pinz: '='
        },
		link: function (scope, elem, attrs) {
			scope.$watch('pinz', function(latestPinz, prevPinz) {
				if (typeof latestPinz !== 'undefined') {
					var allPinz = latestPinz;
					if (typeof prevPinz !== 'undefined') allPinz = allPinz.concat(prevPinz);
					generateTimeline('#'+elem[0].id, allPinz);
				}
   			});
		}
	}
});

function generateTimeline(containerId, rawData) {
	var preparedData = prepareData(rawData, $(containerId).width());
	$(containerId).html("items: " + rawData.length + ", sources: " + Object.keys(preparedData.data).length + ", min: " + preparedData.min + ", max: " + preparedData.max);

	var xScale = d3.time.scale.utc()
		.domain([preparedData.min, preparedData.max])
		.range([0, preparedData.width]);

	var timeline = d3.select(containerId)
		.append("svg:svg")
			.attr("width", preparedData.width + preparedData.sideMargin)
			.attr("height", preparedData.height)
		.append("g")
			.attr("transform", "translate(" + preparedData.sideMargin + "," + preparedData.topMargin + ")");

	addChartJunk(timeline, xScale, preparedData);
}

function prepareData(rawData, containerWidth) {
	var firstDate = Date.parse(rawData[0].t);
	var min = firstDate;
	var max = firstDate;
	var longestSrcNameLength = 0;
	var sortedData = {}; //sort by data source
	rawData.forEach(function(obs) {
		var date = Date.parse(obs.t);
		if (date < min) min = date;
		if (date > max) max = date;

		if (!sortedData.hasOwnProperty(obs.src)) {
			sortedData[obs.src] = [];
			if (obs.src.length > longestSrcNameLength) longestSrcNameLength = obs.src.length;
		}

		sortedData[obs.src].push({
			time: date
		});
	});

	//TODO don't need all the data on timeline, only what is viewable to the eye

	var topMargin = 20;
	var sideMargin = 8 * longestSrcNameLength;
	var barHeight = 10;
	return {
		data: sortedData,
		min: min,
		max: max,
		hours: (max - min) / 3600000,
		topMargin: topMargin,
		sideMargin: sideMargin,
		width: containerWidth - sideMargin,
		barHeight: barHeight,
		height: ((barHeight + barHeight/2) * Object.keys(sortedData).length) + topMargin + barHeight/2
	}
}

function addChartJunk(timeline, xScale, preparedData) {
	//Display source labels (y-axis labels)
	timeline.selectAll("text")
		.data(Object.keys(preparedData.data))
		.enter().append("svg:text")
			.attr("x", 0)
			.attr("dx", -1 * preparedData.sideMargin)
			.attr("y", function(d, i) {
				return (i+1) * (preparedData.barHeight + preparedData.barHeight/2);
			})
			.style("font-weigth", "bold")
			.text(function(d) {
				return d;
			});

	//Display x-axis lines
	timeline.selectAll("line")
		.data(xScale.ticks(10))
		.enter().append("svg:line")
			.attr("x1", xScale)
			.attr("x2", xScale)
			.attr("y1", 0)
			.attr("y2", preparedData.height)
			.style("stroke", "#666");

	//Display x-axis labels
	timeline.selectAll(".axisLabel")
		.data(xScale.ticks(10))
		.enter().append("svg:text")
			.attr("class", "axisLabel")
			.attr("x", xScale)
			.attr("y", 0)
			.attr("dy", "-0.8em")
			.attr("text-anchor", "middle")
			.style("fill", "#666")
			.style("font-size", "0.8em")
			.text(function(d, i) {
				return d.getUTCHours();
			});
}

var sampleDate = [
	{
		src: "earthquake",
		t: new Date()
	},
	{
		src: "animal",
		t: new Date()
	}
]