$( function() {
$( "#slider-range" ).slider({
  range: true,
  min: 2013,
  max: 2018,
  values: [ 2017, 2018 ],
  slide: function( event, ui ) {
    $( "#year" ).val( "" +  ui.values[0] + " - " + ui.values[1]);
    searchAll(document.getElementById('term').innerText, ui.values[0].toString()[3] + " - " + ui.values[1].toString()[3])
  }
});
$( "#year" ).val( "" + $( "#slider-range" ).slider( "values", 0 ) +
  " - " + $( "#slider-range" ).slider( "values", 1 ) );
} );