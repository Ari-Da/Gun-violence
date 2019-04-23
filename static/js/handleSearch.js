function searchAll(term, year){
    document.getElementById('term').innerText = term;
    var years = year.split(" - ");
    var lastYearNo = [];

    years.forEach(function (y) {
        lastYearNo.push(y[y.length-1]);
    });

    year = lastYearNo.join(" - ");

    //console.log(year);

    $.ajax({
        type: "GET",
        dataType: "json",
        url: "/locations?user_input=" + term + "&year_input=" + year,
        success: function (result) {
            if(usMap.hasLayer(circleLayer)) {
                getCircles(result);
                getChoropleth(result);
            } else {
                switchChoropleth(choroplethLayer, legend, info);
                getChoropleth(result);
                switchChoropleth(choroplethLayer, legend, info, false);
                getCircles(result);
                usMap.removeLayer(circleLayer);
            }
        }
    });
}

function searchNearby(e, id, dist) {
    if(event.keyCode === 13) {
        event.preventDefault(); // Ensure it is only this code that runs
        $.ajax({
            type: "GET",
            dataType: "json",
            url: "/distance/id=" + id + "/dist=" + dist,
            success: getCircles
        });
    }
}
