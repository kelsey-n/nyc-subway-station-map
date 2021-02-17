mapboxgl.accessToken = 'pk.eyJ1Ijoia25hbmFuIiwiYSI6ImNrbDlsMXNmNjI3MnEyb25yYjNremFwYXQifQ.l6loLOR-pOL_U2kzWBSQNQ';

// 1. Initialize mapboxgl map and insert into mapcontainer div:
var map = new mapboxgl.Map({
  container: 'mapcontainer', // container ID
  style: 'mapbox://styles/knanan/ckl9lm5sf11v518qh75xrbfzo', // style URL
  center: [-74.0060, 40.7128], // starting position [lng, lat]
  zoom: 12 // starting zoom
});


// 2. Make a global object of key:value pairs to define:
// (a) the Pantone hex line colors (taken from http://web.mta.info/developers/resources/line_colors.htm), and
// (b) the subway lines that fall under each line color:
var colordict = {
  "blue" : ['#0039A6', 'A,C,E'],
  "brown" : ['#996633', 'J,Z'],
  "gray" : ['#A7A9AC', 'L'],
  "green" : ['#00933C', '4,5,6'],
  "lightgreen" : ['#6CBE45', 'G'],
  "multiple" : ['black', 'multiple'],
  "orange" : ['#FF6319', 'B,D,F,M'],
  "purple" : ['#B933AD', '7'],
  "red" : ['#EE352E', '1,2,3'],
  "shuttlegray" : ['#808183', 'S'],
  "yellow" : ['#FCCC0A', 'N,Q,R,W'],
}

// 3. Add subway station data to the map

$.getJSON('./data/subwaystations.json', function(SubwayStations) {

  SubwayStations.forEach(function(SubwayStation) {
    // set the content for the popup for each subway station:
    var html = `
      <div>
        <h3>${SubwayStation.station_name}</h3>
        <div>${SubwayStation.line}</div>
        <div>"${SubwayStation.notes}"</div>
      </div>
    `
    // create the marker for each station; set the color to the appropriate hex color according to the color dictionary object:
    new mapboxgl.Marker({
      color: colordict[SubwayStation.color][0]
    })
      .setLngLat([SubwayStation.longitude, SubwayStation.latitude])
      .setPopup(new mapboxgl.Popup().setHTML(html)) // add popup
      .addTo(map);
  })
})

// 4. Create a legend that will also act as a filter - create buttons for each subway line, colored according to colordict

// first iterate over each key:value pair in the colordict object:
$.each(colordict, function(colorkey) {
  // ignore the color for 'multiple' subway lines, as we want to create a legend/filter for each single subway line
  if(colorkey !== 'multiple')
  {
    // create an iterable array of the subway lines for each color:
    subwaylines = colordict[colorkey][1].split(',')
    subwaylines.forEach(function(subwayline) {
      // for each subway line: create a button, color it according to colordict then add it to each .station-buttons class:
      $('.station-buttons').append(`
        <button type="button" style="background-color:${colordict[colorkey][0]}">${subwayline}</button>`)
      })
  }

})

// 5. Create a function that filters the subway stations shown depending on the user's selections in the interactive legend

// WANT TO DO: on clicking #first-station: hide subway stations that do not have that value in their 'line'
// on clicking #second-station: hide subway stations that do not have that value and the first-station value in their 'line' 
