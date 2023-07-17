mapboxgl.accessToken = 'pk.eyJ1Ijoic3Rhbm9wMDkiLCJhIjoiY2xqcmhndWtxMGVuMzNjcnkyNjZ6eWZ5NiJ9.OSXBLFAFrFcw5S7mB93ePQ';
// Get the style select element and the selected style
var styleSelect = document.getElementById('style-select');
var selectedStyle = styleSelect.value;

// Create a new map instance
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

// Create a geocoder instance
var geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  mapboxgl: mapboxgl,
  marker: true,
  minLength: 2, // Specify the minimum length of input before searching
  placeholder: "Enter a location"
});

document.getElementById('search').appendChild(geocoder.onAdd(map)); // Add the geocoder to the search container

var addressInput = document.getElementById('address'); // Get the address input element

// Event listener when a location is selected from the geocoder results
geocoder.on('result', function (e) {
  map.flyTo({ center: e.result.center, zoom: 12 }); // Zoom to the selected location with a zoom level of 12
  var result = e.result;
  if (result.place_name) {
    addressInput.value = result.place_name;
    $(addressInput).siblings("label").addClass("active"); // set address label to active
    addressInput.focus();
    M.updateTextFields(); // materialize function
  }
});

// Event listener for the search button click
document.getElementById('search-button').addEventListener('click', function () {
  var query = document.getElementById('search').value;
  if (query !== '') {
    geocoder.query(query);
  }
});

// Event listener for the input in the search box
document.getElementById('search').addEventListener('input', function () {
  addressInput.value = '';
});

// Function to fetch suggestions based on search input
function fetchSuggestions() {
  var searchInput = document.getElementById('search').value.trim(); // trims whitespace from the search value
  var suggestionsContainer = document.getElementById('suggestions'); // retrieves suggestions and displays suggested locations
  suggestionsContainer.innerHTML = ''; // sets property of suggestions container to an empty string clearing existing content

  // once the search input is over 2 characters, the suggestion container becomes visible
  if (searchInput.length < 2) {
    suggestionsContainer.classList.remove('visible');
    return;
  }

  var autocompleteUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + encodeURIComponent(searchInput) + '.json?access_token=' + mapboxgl.accessToken;
  // Get the latitude and longitude input elements
  var addressLat = document.getElementById('addressLat');
  var addressLong = document.getElementById('addressLong');

  fetch(autocompleteUrl)
    .then(response => response.json())
    .then(data => {
      if (data.features.length > 0) {
        for (var i = 0; i < 4 && i < data.features.length; i++) {
          // Immediately-invoked function expression (IIFE) to capture the current feature
          (function (feature) {
            // Create a suggestion element
            var suggestion = document.createElement('div');
            suggestion.classList.add('suggestion');
            suggestion.textContent = feature.place_name;

            // Event listener for when a suggestion is clicked
            suggestion.addEventListener('click', function () {
              document.getElementById('search').value = feature.place_name;
              geocoder.query(feature.place_name);

              // store the selected places' co-ordinates.
              addressLong.value = feature.geometry.coordinates[0];
              $(addressLong).trigger("change");
              addressLat.value = feature.geometry.coordinates[1];
              $(addressLat).trigger("change");

              // Clear the suggestions container and hide it
              suggestionsContainer.innerHTML = '';
              suggestionsContainer.classList.remove('visible');
            });

            // Append the dynamically created suggestion element to the suggestions container
            suggestionsContainer.appendChild(suggestion);
          })(data.features[i]); // an immediately-invoked function expression (IIFE) that wraps around the block of code capturing the current data.features[i] feature from the data.features and binds it to the feature parameter inside the function. Doing so makes sure that each suggestion's event listener has access to the right feature when clicked.
        }

        suggestionsContainer.classList.add('visible');
      } else {
        suggestionsContainer.classList.remove('visible');
      }
    })
    .catch(error => console.log(error));
}

$(document).ready(function () {
  // Event listener for the click on a collection item to "fly to area on map" once clicked
  $("#list_area").on("click", ".collection-item", function () {
    var key = $(this).attr("data-key");
    var data = JSON.parse(localStorage.getItem(key));
    var address = data.address;

    flyToAddress(address);
  });
});

// Section for 'Popular This Week' homepage feature to fly to locations on the map on bucketlist.html
var urlParams = new URLSearchParams(window.location.search); //gets the destination address
var address = urlParams.get('address'); //makes the address the destination address

if (address) {
  flyToAddress(address);
}

// Function to fly to a specific address on the map
function flyToAddress(address) {
  geocoder.query(address, function (results) {
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