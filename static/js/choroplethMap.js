//var mapLayer = L.tileLayer('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png', {attribution: 'OSM'});
var choroplethLayer;
var legend;
var info;
var max = 0;
var grades = [];

var getChoropleth = function (result) {
    max = 0;
    statesData['features'].forEach(state => {
            delete state.properties.density;
            result[1].forEach(stateCount => {
                if(stateCount.state === state.properties.name) {
                    state.properties.nInjured = stateCount.injuredCount;
                    state.properties.nKilled = stateCount.killedCount;
                }
            });
            var total = state.properties.nInjured + state.properties.nKilled;
                    if(total > max)
                        max = total;
        });

    if(max <= 50)
        grades = [0, 10, 20, 25, 30, 35, 45, 50];
    else if(max <= 100)
        grades = [0, 20, 40, 60, 70, 80, 90, 100];
    else if(max <= 200)
        grades = [0, 25, 50, 75, 100, 150, 175, 200];
    else if(max <= 300)
        grades = [0, 25, 50, 100, 150, 200, 250, 300];
    else if(max <= 500)
        grades = [0, 50, 100, 200, 300, 400, 450, 500];
    else if(max <= 600)
        grades = [0, 50, 100, 200, 300, 400, 500, 600];
    else if(max <= 700)
        grades = [0, 100, 200, 300, 400, 500, 600, 700];
    else if(max <= 1000)
        grades = [0, 100, 200, 300, 500, 600, 800, 1000];
    else
        grades = [0, 500, 1000, 2000, 3000, 4000, 7000, 10000];


    choroplethLayer = L.geoJson(statesData, {
        style: style,
        onEachFeature: onEachFeature
    });

    info = L.control();

    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        this.update();
        return this._div;
    };

    info.update = function (prop) {
        this._div.innerHTML = '<h4>Number of killed and injured</h4>' + (prop ?
            '<b>' + prop.name + '</b>: ' + new Intl.NumberFormat('en-IN').format(prop.nInjured + prop.nKilled)
            : 'Hover over a state');
    };

    //info.addTo(usMap);

    // add lengend
    legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend');

        for (var i = grades.length - 1; i >= 0; i--) {
            div.innerHTML +=
                '<p><i style="background:' + (grades[i + 1] ? getColor(grades[i+1]) : getColor(grades[i] + 1)) + '"></i><span>' +
                grades[i] + (grades[i + 1] ? ' &ndash; ' + grades[i + 1] + '</span></p>' : ' +</p>');
        }

        return div;
    };
    //legend.addTo(usMap);
};


function getColor(num) {
    /*return num > 10000 ? '#800026' :
        num > 7000 ? '#BD0026' :
            num > 4000 ? '#E31A1C' :
                num > 3000 ? '#FC4E2A' :
                    num > 2000 ? '#FD8D3C' :
                        num > 1000 ? '#FEB24C' :
                            num > 500 ? '#FED976' :
                                '#FFEDA0';*/

    var colors = ['#FFEDA0', '#FED976', '#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026'];
    var color = '';

    for(var i = 0; i < grades.length; i++) {
        if(num > grades[i])
            color = colors[i];
    }

    return color;
}

function style(feature) {
    return {
        fillColor: getColor(feature.properties.nInjured + feature.properties.nKilled),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '2',
        fillOpacity: 0.7
    };
}

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 3,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    info.update(layer.feature.properties);

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
}

function resetHighlight(e) {
    choroplethLayer.resetStyle(e.target);
    info.update();
}

function zoomToFeature(e) {
    usMap.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

$.ajax({
    type: "GET",
    dataType: "json",
    url: "http://localhost:5000/locations",
    success: getChoropleth
});