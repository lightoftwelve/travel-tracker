// Start of the attached script for the map
mapboxgl.accessToken = 'pk.eyJ1Ijoic3Rhbm9wMDkiLCJhIjoiY2xqcmhndWtxMGVuMzNjcnkyNjZ6eWZ5NiJ9.OSXBLFAFrFcw5S7mB93ePQ';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [0, 0], // Set the initial center to the world map
  zoom: 1 // Set the initial zoom level for the world map
});

var geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  mapboxgl: mapboxgl,
  marker: true,
  minLength: 2, // Specify the minimum length of input before searching
  placeholder: "Enter a location"
});

document.getElementById('search').appendChild(geocoder.onAdd(map));

var addressInput = document.getElementById('address');

geocoder.on('result', function (e) {
  map.flyTo({ center: e.result.center, zoom: 12 }); // Zoom to the selected location with a zoom level of 12
  var result = e.result;
  if (result.place_name) {
    addressInput.value = result.place_name;
    $(addressInput).siblings("label").addClass("active");
  }
});

document.getElementById('search-button').addEventListener('click', function () {
  var query = document.getElementById('search').value;
  if (query !== '') {
    geocoder.query(query);
  }
});

document.getElementById('search').addEventListener('input', function () {
  addressInput.value = '';
});