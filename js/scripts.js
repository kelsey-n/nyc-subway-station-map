mapboxgl.accessToken = 'pk.eyJ1Ijoia25hbmFuIiwiYSI6ImNrbDlsMXNmNjI3MnEyb25yYjNremFwYXQifQ.l6loLOR-pOL_U2kzWBSQNQ';

// 1. Initialize mapboxgl map and insert into mapcontainer div:
var map = new mapboxgl.Map({
  container: 'mapcontainer', // container ID
  style: 'mapbox://styles/knanan/ckle1rswq26lu17paw71lych7', // style URL
  center: [-73.984, 40.7128], // starting position [lng, lat]
  zoom: 11.5 // starting zoom
});

// add navigation control:
map.addControl(new mapboxgl.NavigationControl({
  showCompass: false,
  showZoom: true
}));

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
};

// 3. Create a legend that will also act as a filter - create buttons for each subway line, colored according to colordict
// first iterate over each key:value pair in the colordict object:
$.each(colordict, function(colorkey) {
  // ignore the color for 'multiple' subway lines
  if(colorkey !== 'multiple') {
    subwaylines = colordict[colorkey][1].split(','); //iterable array of the subway lines for each color
    subwaylines.forEach(function(subwayline) {
      // for each subway line: create a button, color it according to colordict then add it to each .station-buttons class
      // we will also add an id so that each button can be identified upon clicking and we can then filter the markers
      $('.first-station-buttons').append(`
        <button type="button" style="background-color:${colordict[colorkey][0]}" class = 'first-button' id='${subwayline}'>${subwayline}</button>
        `);
      $('.second-station-buttons').append(`
        <button type="button" style="background-color:${colordict[colorkey][0]}" class = 'second-button' id='${subwayline}' disabled>${subwayline}</button>
        `);
    });
    $('.first-station-buttons').append('<br/>');
    $('.second-station-buttons').append('<br/>');
  }
});

// 4. Add subway stations to the map as markers and add logic to add/remove markers based on marker variable names and button clicked

// create an empty variable array to hold the variable names of each marker as they are made
// this will be used to search for the markers that match criteria for filtering
var marker_varnames = [];

$.getJSON('./data/subwaystations.json', function(SubwayStations) {
  // each row in the data represents a subway station:
  SubwayStations.forEach(function(SubwayStation) {
    // set and style the content for each station popup:
    var html_popup = `
      <div>
        <div style = "font-family:sans-serif; font-size:14px; font-weight:bold">${SubwayStation.station_name}</div>
        <div style = "font-family:sans-serif; font-size:12px; font-weight:600">${SubwayStation.line}</div>
        <div style = "font-family:sans-serif; font-size:11px; margin-top: 10px">${SubwayStation.notes}</div>
      </div>
    `;
    // create the marker for each station; set the color to the appropriate hex color according to the color dictionary object
    // use global window variables to define each marker so that they can be called on outside
    // the scope of this function in order to add/remove markers from the map:
    window[SubwayStation.objectid+'_'+SubwayStation.line_varname+'_'+SubwayStation.all_lines_varname] = new mapboxgl.Marker({
                                                                                                        color: colordict[SubwayStation.color][0],
                                                                                                        scale: 0.5
                                                                                                        })
                                                                                                        .setLngLat([SubwayStation.longitude, SubwayStation.latitude])
                                                                                                        .setPopup(new mapboxgl.Popup().setHTML(html_popup)) //add popup
                                                                                                        .addTo(map);
    // push the variable name for each marker to the array previously defined
    // the variable name is unique (due to objectid) and also identifies:
    // line_varname: lines that go directly to each station, and
    // all_lines_varname: any line that can possibly transfer to the station (including from a different station - station complexes)
    marker_varnames.push(`${SubwayStation.objectid}_${SubwayStation.line_varname}_${SubwayStation.all_lines_varname}`);
  });

  // function to add/remove markers based on which button is clicked:
  $('.first-button').click(function() {
    $('.first-button').removeClass("selected-button-class");
    $('.second-button').removeClass("selected-button-class"); //remove style of any previously selected buttons when a first station button is clicked
    var button_id = $(this).attr('id'); //button id = subway line to 'filter' on

    // search for the marker variable names that contain the button id subway line
    if (button_id !=='reset-button') {
      $(this).addClass("selected-button-class"); //add styling for a selected button
      $('.second-button').prop("disabled", false); //enable second station buttons so user has option to click on them
      $('.second-button').css("opacity", 1);
      $('.second-button').addClass("second-button-hoverclass");
      // loop over the marker variable names in the array to see which ones contain the button id:
      marker_varnames.forEach(function(variable) {
        if (variable.split('_')[1].includes(button_id)) {
          window[variable].addTo(map); //add markers that contain the button id in the variable name to the map
        } else {
          window[variable].remove(); //remove markers that do not contain the button id's line
        }
      });
    }

    // if the reset button is clicked, add back all markers to the map, remove styling for previous button selections and disable second station buttons again
    if (button_id==='reset-button') {
      marker_varnames.forEach(function(variable) {
        window[variable].addTo(map);
      });
      $('.second-button').prop("disabled", true);
      $('.second-button').css("opacity", 0.6);
      $('.second-button').removeClass("second-button-hoverclass");
    }

    // when second (transfer) station button is clicked, add selected button styling and remove any previous styling ~only~ from a second station button
    $('.second-button').click(function() {
      $('.second-button').removeClass("selected-button-class");
      $(this).addClass("selected-button-class");
      var button_id_2 = $(this).attr('id'); //button id 2 = transfer station
      // now add variables where: (first station AND transfer station in all_lines_varname) AND (first station OR transfer station in lines_varname)
      marker_varnames.forEach(function(variable) {
        //neaten this
        if ( (variable.split('_')[2].includes(button_id) && variable.split('_')[2].includes(button_id_2)) &&
            ((variable.split('_')[1].includes(button_id)) || (variable.split('_')[1].includes(button_id_2))) ) {
          window[variable].addTo(map);
        } else {
          window[variable].remove();
        }
      });
    });
  });
});
