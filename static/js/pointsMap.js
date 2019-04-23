var circleLayer;
var options = {color: 'red', opacity: 0.4, fillColor: '#f03', fillOpacity: 0.6};
var inputs = "<label for='distance_input'>Search within distance: " +
    "</label><input type='number' " +
    "id='distance_input' name='distance_input' " +
    "placeholder='in km' min='1' " +
    "onkeypress='searchNearby(event, document.getElementById(\"incident_id\").innerText, this.value)'>";

var getCircles = function (result) {
    if(usMap.hasLayer(circleLayer))
        usMap.removeLayer(circleLayer);

    var circles = [];
    result[0].forEach(element => {
        var circle = L.circle([element.lat, element.lng], {
        }).bindPopup(inputs);

        circle.setStyle(options);
        circle.setRadius(1500);

        circle.on("popupopen", function () {
            document.getElementById("incident_id").innerText = element.id;
        });
        circle.on("popupclose", function () {
            $('#incident_content').html("<h1>Click on a point to see more data!</h1>");
        });

        circle.on("click", function() {
          var id = document.getElementById("incident_id").innerText;
          getIncidentContent(id);
        });

        circles.push(circle);
    });

    circleLayer = L.layerGroup(circles);
    circleLayer.addTo(usMap);
};

$.ajax({
    type: "GET",
    dataType: "json",
    url: "http://localhost:5000/locations",
    success: getCircles
});

var mapLayer = L.tileLayer('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png', {attribution: 'OSM'});

var usMap = L.map('map', {
    center: [37.8, -96],
    zoom: 4,
    minZoom: 3,
    layers: [mapLayer]
});

function getIncidentContent(id) {
  $.ajax({
      type: "GET",
      dataType: "json",
      url: "http://localhost:5000/content/id=" + id,
      success: function (result) {
          var div = $('#incident_content');

          var showContent = "<img id='state_img' src='data:image/jpg;base64, " + result[1] + "'>";
          showContent += "<p><span>State: </span>" + result[0]['state'] + "</p>";
          showContent += "<p><span>Address: </span>";
          if(result[0]['address']==="")
              showContent += "Unknown</p>";
          else
              showContent += result[0]['address'] + "</p>";
          showContent += "<p><span>Notes: </span>" + result[0]['notes'] + "</p>";

          showContent += "<a href='" + result[0]['source_url'] + "' target='_blank'>Read more</a>";

          var participantCount = Object.keys(result[0]['participants']).length;
          console.log(result[0]);

          if(participantCount != 0 ) {
              showContent += "<p style='margin-top: 30px;'><span>Number of participants: </span>" + participantCount +"</p>";
              showContent += "<div id='participants'>";

              for(var key in result[0]['participants']) {
                    showContent += "<div><h4 class='part'>Participant " + (parseInt(key) + 1) + "</h4>";
                    if("name" in result[0]['participants'][key])
                        showContent += "<p><span>Name: </span>" + result[0]['participants'][key]['name'] + "</p>";
                    if("age" in result[0]['participants'][key])
                        showContent += "<p><span>Age: </span>" + result[0]['participants'][key]['age'] + "</p>";
                    else if("age_group" in result[0]['participants'][key])
                        showContent += "<p><span>Age group: </span>" + result[0]['participants'][key]['age_group'] + "</p>";
                    if("gender" in result[0]['participants'][key])
                        showContent += "<p><span>Gender: </span>" + result[0]['participants'][key]['gender'] + "</p>";
                    if("status" in result[0]['participants'][key])
                        showContent += "<p><span>Verdict: </span>" + result[0]['participants'][key]['status'] + "</p>";
                    if("type" in result[0]['participants'][key])
                        showContent += "<p><span>Role: </span>" + result[0]['participants'][key]['type'] + "</p>";
                    showContent += "</div>";
              }


              showContent+="</div>";

          }
          else {
              showContent += "<p class='part'><span>No killed or injured</span></p>";
          }


          showContent+="<div id='comment_section'><h3>Comments</h3>";
          showContent+="<div id='comments'>";

          if("comments" in result[0]) {
              result[0]['comments'].forEach(function (e) {
                showContent += "<p>" + e['comment'] + " - <span>" + e['name'] + "</span></p>";
              });

          }

          showContent += "</div><div id='comments_form'>";
          showContent += "<input id='user_name' class='form-control' type='text' placeholder='Enter name...' style='width: 80%'>";
          showContent += "<input id='user_comment' class='form-control' type='text' placeholder='Enter comment...' style='width: 80%'>";
          showContent += "<input id='user_input' class='btn btn-default' type='submit' onclick='buttonClick("+id+")' style='float: none'>";
          showContent += "</div>";

          showContent += "</div>";

          //var showImg = "<img id='state_img' src='http://localhost:5000/img/id=" + id + "'>";
          $('#incident_content').html(showContent);
      }
  });

}

function buttonClick (id) {
    var user_name = $("#user_name").val();
    var user_comment = $("#user_comment").val();

    if(user_name.length===0)
        user_name = "Anonymous";

    if(user_comment.length!==0) {
        $.post({
            url: "/addComment/id="+ id,
            data: {
                user_name: user_name,
                user_comment: user_comment
            },
            success: function (result) {
                var c = $("<p>" + user_comment + " - <span>" + user_name + "</span></p>");
                $("#comments").append(c);
            }

        });
    }
};


