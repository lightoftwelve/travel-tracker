// Start of the attached script for the map
mapboxgl.accessToken = 'pk.eyJ1Ijoic3Rhbm9wMDkiLCJhIjoiY2xqcmhndWtxMGVuMzNjcnkyNjZ6eWZ5NiJ9.OSXBLFAFrFcw5S7mB93ePQ';

//Get the style select element and its value
var styleSelect = document.getElementById('style-select');
var selectedStyle = styleSelect.value;

//Creates the map
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

//Creates a geocoder for address search
var geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  mapboxgl: mapboxgl,
  marker: true,
  minLength: 2, // Specify the minimum length of input before searching
  placeholder: "Enter a location"
});

// Append the geocoder control to the search element
document.getElementById('search').appendChild(geocoder.onAdd(map));

// Get the address input element
var addressInput = document.getElementById('address');

// Event listener for when a location is selected from the geocoder results
geocoder.on('result', function (e) {
  map.flyTo({ center: e.result.center, zoom: 12 }); // Zoom to the selected location with a zoom level of 12
  var result = e.result;
  if (result.place_name) {
    addressInput.value = result.place_name;
    $(addressInput).siblings("label").addClass("active");
  }
});

// Event listener for the search button click
document.getElementById('search-button').addEventListener('click', function () {
  var query = document.getElementById('search').value;
  if (query !== '') {
    geocoder.query(query);
  }
});

// Event listener for clearing the address input when search input changes
document.getElementById('search').addEventListener('input', function () {
  addressInput.value = '';
});

// Search suggestion code
function fetchSuggestions() {
  var searchInput = document.getElementById('search').value.trim();
  var suggestionsContainer = document.getElementById('suggestions');
  suggestionsContainer.innerHTML = '';

  if (searchInput.length < 2) {
    // If search input is less than 2 characters, hide suggestions and return
    suggestionsContainer.classList.remove('visible');
    return;
  }

  // Construct the URL for the autocomplete API request
  var autocompleteUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + encodeURIComponent(searchInput) + '.json?access_token=' + mapboxgl.accessToken;
  // Need to store the latitude and longitude coordinates of the place
  var addressLat = document.getElementById('addressLat');
  var addressLong = document.getElementById('addressLong');

  // Fetch suggestions from Mapbox Geocoding API
  fetch(autocompleteUrl)
    .then(response => response.json())
    .then(data => {
      if (data.features.length > 0) {
        // Iterate through the suggestion features and create suggestion elements
        for (var i = 0; i < 4 && i < data.features.length; i++) {
          (function (feature) {
            var suggestion = document.createElement('div');
            suggestion.classList.add('suggestion');
            suggestion.textContent = feature.place_name;
            suggestion.addEventListener('click', function () {
              // Set the selected suggestion as the search input value
              document.getElementById('search').value = feature.place_name;
              // Trigger geocoder query for the selected suggestion
              geocoder.query(feature.place_name);
              // store the selected places' co-ordinates
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

// Map interaction with the collection item
$(document).ready(function() {
  // Event listener for clicking on a collection item
  $("#list_area").on("click", ".collection-item", function() {
    var key = $(this).attr("data-key");
    var data = JSON.parse(localStorage.getItem(key));

    var address = data.address;

    // Fly to the selected address
    flyToAddress(address);
  });
});

// Frontpage interaction
var urlParams = new URLSearchParams(window.location.search); // Gets the destination address
var address = urlParams.get('address'); // Makes the address the destination address

if (address) {
  flyToAddress(address);
} // Fly to the address

//Fly to address function
function flyToAddress(address) {
  // Query the geocoder for the address and fly to the result if found
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