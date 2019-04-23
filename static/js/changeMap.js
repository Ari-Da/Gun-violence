function switchChoropleth(layer, legend, info, remove=true) {
    if(remove) {
        usMap.removeLayer(layer);
        usMap.removeControl(legend);
        usMap.removeControl(info);
    } else {
        usMap.addLayer(layer);
        usMap.addControl(legend);
        usMap.addControl(info);
    }
}

function switchCircle(layer, remove=true) {
    if(remove) {
        usMap.removeLayer(layer);
    }
    else {
        usMap.addLayer(layer);
    }
}

function change(myMap) {
    if(myMap.hasLayer(choroplethLayer)) {
        switchChoropleth(choroplethLayer, legend, info);
        myMap.addLayer(circleLayer);
        document.getElementById("changeMap").style.color = "#8B8B8B";
        document.getElementById("incident_content").innerHTML = "<h1>Click on a point to see more data!</h1>";
    } else {
        myMap.removeLayer(circleLayer);
        switchChoropleth(choroplethLayer, legend, info, false);
        document.getElementById("changeMap").style.color = "#f5002d";
        document.getElementById("incident_content").innerHTML = "";
    }
}