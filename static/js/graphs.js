queue()
    .defer(d3.json, "/GunViolence/AllData")
    .defer(d3.json, "static/geojson/us-states.json")
    .await(makeGraphs);

function makeGraphs(error, projectsJson, statesJson) {

	//Clean projectsJson data
	var gunViolenceProjects = projectsJson;
	var dateFormat = d3.time.format("%m/%d/%Y");
	gunViolenceProjects.forEach(function(d) {
    //console.log(d["date"]);
		d["date"] = dateFormat.parse(d["date"]);
		d["date"].setDate(1);
		d["n_killed"] = +d["n_killed"];
		d["n_injured"] = +d["n_injured"];
	});

	//Create a Crossfilter instance
	var ndx = crossfilter(gunViolenceProjects);

	//Define Dimensions
	var dateDim = ndx.dimension(function(d) { return d["date"]; });
	var stateDim = ndx.dimension(function(d) { return d["state"]; });
	var totalKilledDim  = ndx.dimension(function(d) { return d["n_killed"]; });
	var totalInjuredDim = ndx.dimension(function(d) { return d["n_injured"]; });

	//Calculate metrics
	var countByDate = dateDim.group().reduceSum(function(d) {
		return d["n_killed"] + d["n_injured"];
	});
	var countByState = stateDim.group().reduceSum(function(d) {
		return d["n_killed"] + d["n_injured"];
	//var totalInjuredByState = stateDim.group().reduceSum(function(d) {
		//return d["n_injured"];
	});

	var all = ndx.groupAll();

  	var totalKilled = ndx.groupAll().reduceSum(function(d) {return d["n_killed"];});
  	var totalInjured = ndx.groupAll().reduceSum(function(d) {return d["n_injured"];});
	var max_state = countByState.top(1)[0].value;
    //var max_state = totalInjuredByState.top(1)[0].value;

	//Define values (to be used in charts)
	var minDate = dateDim.bottom(1)[0]["date"];
	var maxDate = dateDim.top(1)[0]["date"];

    //Charts
	var timeChart = dc.barChart("#time-chart");
	var usChart = dc.geoChoroplethChart("#us-chart");
	var totalKilledND = dc.numberDisplay("#total-kills-nd");
	var totalInjuredND = dc.numberDisplay("#total-injured-nd");


    totalInjuredND
        .formatNumber(d3.format("d"))
		.valueAccessor(function(d){return d; })
		.group(totalInjured);


	totalKilledND
		.formatNumber(d3.format("d"))
		.valueAccessor(function(d){return d; })
		.group(totalKilled);

	timeChart
		.width(600)
		.height(160)
		.margins({top: 10, right: 50, bottom: 30, left: 50})
		.dimension(dateDim)
		.group(countByDate)
		.transitionDuration(500)
		.x(d3.time.scale().domain([minDate, maxDate]))
		.elasticY(true)
		.xAxisLabel("")
		.yAxis().ticks(4);

	usChart.width(1000)
		.height(330)
		.dimension(stateDim)
		.group(countByState)
		.colors(["#FF9933", "#FF6600", "#FF3300", "#FF0000", "#D80000", "#C80000", "#B80000", "#A80000", "#A00000", "#900000"])
		.colorDomain([0, max_state])
		.overlayGeoJson(statesJson["features"], "state", function (d) {
			return d.properties.name;
		})
		.projection(d3.geo.albersUsa()
    				.scale(600)
    				.translate([340, 150]))
		.title(function (p) {
			return "State: " + p["key"]
					+ "\n"
					+ "Total killed and injured: " + p["value"];
		});

    dc.renderAll();
}
