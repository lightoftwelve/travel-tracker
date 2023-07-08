// Start of the attached the script for the map
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
    marker: false,
    minLength: 2, // Specify the minimum length of input before searching
    placeholder: "Enter a location"
});

document.getElementById('search').appendChild(geocoder.onAdd(map));

geocoder.on('result', function (e) {
    map.flyTo({ center: e.result.center, zoom: 12 }); // Zoom to the selected location with a zoom level of 12
    populateTitleAndAddress(e.result);
    clearAutocompleteDropdown();
});

geocoder.on('results', function (e) {
    var results = e.features;
    if (results.length > 0) {
        var dropdown = document.getElementById('autocomplete-dropdown');
        dropdown.innerHTML = '';

        results.forEach(function (result) {
            var item = document.createElement('div');
            item.classList.add('autocomplete-item');
            item.textContent = result.place_name;
            item.addEventListener('click', function () {
                geocoder.query(result.place_name);
                clearAutocompleteDropdown();
            });
            dropdown.appendChild(item);
        });
    }
});

document.getElementById('search').addEventListener('input', function () {
    var input = this.value;
    if (input.length >= geocoder.options.minLength) {
        geocoder.query(input);
    } else {
        clearAutocompleteDropdown();
    }
});