
$.ajax({
    type: "GET",
    dataType: "json",
    url: "http://localhost:5000/counts",
    success: function (counts) {
        statesData['features'].forEach(state => {
            delete state.properties.density;
            counts.forEach(stateCount => {
                if(stateCount.state === state.properties.name) {
                    state.properties.nInjured = stateCount.injuredCount;
                    state.properties.nKilled = stateCount.killedCount;
                }
            });
        });
    }
});

//console.log(statesData);
