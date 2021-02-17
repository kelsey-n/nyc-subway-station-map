mapboxgl.accessToken = 'pk.eyJ1Ijoia25hbmFuIiwiYSI6ImNrbDlsMXNmNjI3MnEyb25yYjNremFwYXQifQ.l6loLOR-pOL_U2kzWBSQNQ';

var map = new mapboxgl.Map({
  container: 'mapcontainer', // container ID
  style: 'mapbox://styles/knanan/ckl9lm5sf11v518qh75xrbfzo', // style URL
  center: [-74.0060, 40.7128], // starting position [lng, lat]
  zoom: 12 // starting zoom
});
