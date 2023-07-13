// Start of the attached script for the map
mapboxgl.accessToken = 'pk.eyJ1Ijoic3Rhbm9wMDkiLCJhIjoiY2xqcmhndWtxMGVuMzNjcnkyNjZ6eWZ5NiJ9.OSXBLFAFrFcw5S7mB93ePQ';
var styleSelect = document.getElementById('style-select');
var selectedStyle = styleSelect.value;

var map = new mapboxgl.Map({
  container: 'map',
  style: selectedStyle,
  center: [0, 0], // Set the initial center to the world map
  zoom: 1 // Set the initial zoom level for the world map
});

// Event listener to update the map style when the user selects a different option
styleSelect.addEventListener('change', function () {
  selectedStyle = styleSelect.value;
  map.setStyle(selectedStyle);
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

// Suggestion code starts here
function fetchSuggestions() {
  var searchInput = document.getElementById('search').value.trim();
  var suggestionsContainer = document.getElementById('suggestions');
  suggestionsContainer.innerHTML = '';

  if (searchInput.length < 2) {
    suggestionsContainer.classList.remove('visible');
    return;
  }

  var autocompleteUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + encodeURIComponent(searchInput) + '.json?access_token=' + mapboxgl.accessToken;
  //need to store Long,Lat coordinates of the place
  var addressLat = document.getElementById('addressLat');
  var addressLong = document.getElementById('addressLong');

  fetch(autocompleteUrl)
    .then(response => response.json())
    .then(data => {
      if (data.features.length > 0) {
        for (var i = 0; i < 4 && i < data.features.length; i++) {
          (function (feature) {
            var suggestion = document.createElement('div');
            suggestion.classList.add('suggestion');
            suggestion.textContent = feature.place_name;
            suggestion.addEventListener('click', function () {
              document.getElementById('search').value = feature.place_name;
              geocoder.query(feature.place_name);
              // store the selected places' co-ordinates.
              addressLong.value = feature.geometry.coordinates[0];
              $(addressLong).trigger("change");
              addressLat.value = feature.geometry.coordinates[1];
              $(addressLat).trigger("change");
              suggestionsContainer.innerHTML = '';
              suggestionsContainer.classList.remove('visible');
            });

            suggestionsContainer.appendChild(suggestion);
          })(data.features[i]);
        }

        suggestionsContainer.classList.add('visible');
      } else {
        suggestionsContainer.classList.remove('visible');
      }
    })
    .catch(error => console.log(error));
}

$(document).ready(function() {
  $("#list_area").on("click", ".collection-item", function() {
    var key = $(this).attr("data-key");
    var data = JSON.parse(localStorage.getItem(key));

    var address = data.address;

    flyToAddress(address);
  });
});

//getting the frontpage flyto working
var urlParams = new URLSearchParams(window.location.search); //gets the destination address
var address = urlParams.get('address'); //makes the address the destination address

if (address) {
  flyToAddress(address);
} //flies to the address

function flyToAddress(address) {
  geocoder.query(address, function(results) {
    if (results.features.length > 0) {
      var coordinates = results.features[0].geometry.coordinates;
      map.flyTo({
        center: coordinates,
        zoom: 12
      });
    } else {
      console.log("Address not found.");
    }
  });  
  
}