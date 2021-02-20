mapboxgl.accessToken = 'pk.eyJ1Ijoia25hbmFuIiwiYSI6ImNrbDlsMXNmNjI3MnEyb25yYjNremFwYXQifQ.l6loLOR-pOL_U2kzWBSQNQ';

// 1. Initialize mapboxgl map and insert into mapcontainer div:
var map = new mapboxgl.Map({
  container: 'mapcontainer', // container ID
  style: 'mapbox://styles/mapbox/light-v10', // style URL
  center: [-74.0060, 40.7128], // starting position [lng, lat]
  zoom: 12 // starting zoom
});


// 2. Make a global object of key:value pairs to define
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

// 3. Create a legend that will also act as a filter - create buttons for each subway line, colored according to colordict

// first iterate over each key:value pair in the colordict object:
$.each(colordict, function(colorkey) {
  // ignore the color for 'multiple' subway lines, as we want to create a legend/filter for each subway line color
  if(colorkey !== 'multiple') {
    subwaylines = colordict[colorkey][1].split(',') // iterable array of the subway lines for each color

    subwaylines.forEach(function(subwayline) {
      // for each subway line: create a button, color it according to colordict then add it to each .station-buttons class
      // we will also add a class and id so that the button clicks can trigger filtering of the markers
      $('.first-station-buttons').append(`
        <button type="button" style="background-color:${colordict[colorkey][0]}" class = 'first-button' id='${subwayline}'>${subwayline}</button>`)
      $('.second-station-buttons').append(`
        <button type="button" style="background-color:${colordict[colorkey][0]}" class = 'second-button' id='${subwayline}'>${subwayline}</button>`)
    })
  }

})

// create an empty variable array to hold the variable names of each marker as they are made
// this will be used to search for the markers that match criteria for filtering
var marker_varnames = []

// 4. Add subway station data to the map
$.getJSON('./data/subwaystations.json', function(SubwayStations) {

  SubwayStations.forEach(function(SubwayStation) {
    // set the content for the popup for each subway station:
    var html_popup = `
      <div>
        <h3>${SubwayStation.station_name}</h3>
        <div>${SubwayStation.line}</div>
        <div>"${SubwayStation.notes}"</div>
      </div>
    `
    // create the marker for each station; set the color to the appropriate hex color according to the color dictionary object
    // we will use window variables (global variables) to 'hold' each marker so that they can be called later on outside
    // the scope of this function in order to add/remove markers from the map
    window[SubwayStation.objectid+'_'+SubwayStation.line_varname] = new mapboxgl.Marker({
      color: colordict[SubwayStation.color][0],
      scale: 0.5
    })
      .setLngLat([SubwayStation.longitude, SubwayStation.latitude])
      .setPopup(new mapboxgl.Popup().setHTML(html_popup)) // add popup
      .addTo(map);

    // we will push the variable name for each marker to the array previously defined
    // the variable name is unique (due to objectid) and also identifies the lines that go to each station (line_varname)
    marker_varnames.push(`${SubwayStation.objectid}_${SubwayStation.line_varname}`)

  })

  // function to add/remove markers based on which button is clicked:
  $('.first-button').click(function() {
    var button_id = $(this).attr('id') // button id = subway line to filter on
    // search for the marker variable names that contain the button id subway line
    marker_varnames.forEach(function(variable) {
    if(variable.split('_')[1].includes(button_id)){window[variable].addTo(map)} // add markers that contain the button id's line to the map
    else{window[variable].remove()} // remove markers that do not contain the button id's line
    })

    $('.second-button').click(function() {
      var button_id_2 = $(this).attr('id')
      marker_varnames.forEach(function(variable) {
      if(variable.split('_')[1].includes(button_id) && variable.split('_')[1].includes(button_id_2)){window[variable].addTo(map)}
      else{window[variable].remove()}
    })
  })

})

})

// may need to hard code in logic for stations like times sq, union sq, grand central, columbus circle, check for others
// EXTRA TO DO'S: making second-stations unclickable until first-station is selected; only making one of each clickable;
// highlighting buttons upon hover and selection
