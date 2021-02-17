mapboxgl.accessToken = 'pk.eyJ1Ijoia25hbmFuIiwiYSI6ImNrbDlsMXNmNjI3MnEyb25yYjNremFwYXQifQ.l6loLOR-pOL_U2kzWBSQNQ';

// initialize mapboxgl map and insert into mapcontainer div:
var map = new mapboxgl.Map({
  container: 'mapcontainer', // container ID
  style: 'mapbox://styles/knanan/ckl9lm5sf11v518qh75xrbfzo', // style URL
  center: [-74.0060, 40.7128], // starting position [lng, lat]
  zoom: 12 // starting zoom
});

// add subway station data to the map:
$.getJSON('./data/subwaystations.json', function(SubwayStations) {

  SubwayStations.forEach(function(SubwayStation) {
    // set the content for the popup for each subway station:
    var html = `
      <div>
        <h3>${SubwayStation.station_name}</h3>
        <div>${SubwayStation.line}</div>
        <div><i>"${SubwayStation.notes}"</i></div>
      </div>
    `
    // make object to map subway line colors to numeric line colors (http://web.mta.info/developers/resources/line_colors.htm):
    var colordict = {
      "blue" : '#0039A6',
      "brown" : '#996633',
      "gray" : '#A7A9AC',
      "green" : '#00933C',
      "lightgreen" : '#6CBE45',
      "multiple" : 'black',
      "orange" : '#FF6319',
      "purple" : '#B933AD',
      "red" : '#EE352E',
      "shuttlegray" : '#808183',
      "yellow" : '#FCCC0A',
    }

    new mapboxgl.Marker({
      color: colordict[SubwayStation.color]
    })
      .setLngLat([SubwayStation.longitude, SubwayStation.latitude])
      .setPopup(new mapboxgl.Popup().setHTML(html)) // add popup
      .addTo(map);
  })
})
