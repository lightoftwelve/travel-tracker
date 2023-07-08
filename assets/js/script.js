$(document).ready(function () {
  $('.slider').slider({
    indicators: true,
    height: 600,
    transition: 500,
    interval: 6000
  });

  $('select').formSelect();

  $("#add_button").click(function () {
    var selectedValue = $("#dropdown").val();
    if (selectedValue) {
      $("#list_area").append("<li class='collection-item'>" + selectedValue + "</li>");
    }
  });

  // Load data from localStorage and append to list
  for (var i = 0; i < localStorage.length; i++) {
    var key = localStorage.key(i).replace('mapbox.eventData.uuid:', ''); // Retrieve the key from localStorage and remove the "mapbox.eventData.uuid:" prefix -> replaces the substring with an empty string so that the key is the right format to be retrieved from the associated JSON data from localStorage
    try {
      var data = JSON.parse(localStorage.getItem(key)); // Retrieve the JSON data from localStorage using the cleaned key

      if (data && data.title) { // Check if data exists and has a title
        var item = $("<li>")
          .addClass("collection-item")
          .text(data.title)
          .attr("data-key", key); // Store the key in a data attribute
        $("#list_area").append(item);
      }
    } catch (error) {
      console.error('Invalid JSON in localStorage for item key:', key, 'Error:', error.message);
    }
  }

  // Updated click function for the list items
  $("#list_area").on("click", ".collection-item", function () {
    var key = $(this).attr("data-key");
    var data = JSON.parse(localStorage.getItem(key));

    populateFields(data);

    // Populate the fields with the loaded data
    $("#title").val(data.title);
    $("#address").val(data.address);
    $("#memos").val(data.memos);
    $("#tickets_needed").prop("checked", data.tickets_needed);
    $("#completed").prop("checked", data.completed);
    $("#budget").val(data.budget);
    $("#category").val(data.category);


    // Update text fields and move labels immediately
    M.updateTextFields(); // materialize function
    moveLabels();
  });

  // Function to move the labels when theres a change in values of the input fields
  function moveLabels() {
    if ($("#title").val() !== '') $("label[for='title']").addClass("active");
    if ($("#address").val() !== '') $("label[for='address']").addClass("active");
    if ($("#memos").val() !== '') $("label[for='memos']").addClass("active");
    if ($("#budget").val() !== '') $("label[for='budget']").addClass("active");
  }


  function setLabelsActive() {
    $("label[for='title']").addClass("active");
    $("label[for='address']").addClass("active");
    $("label[for='memos']").addClass("active");
    $("label[for='budget']").addClass("active");
  }

  // function to set the labels to active when loading data from localStorage. It directly adds labels without checking the values of the input fields
  function populateFields(bucket) {
    $('#title').val(bucket.title);
    $('#address').val(bucket.address);
    $('#memos').val(bucket.memos);
    $('#budget').val(bucket.budget);

    // Set checkbox status
    $('#tickets_needed').prop('checked', bucket.ticketsNeeded);
    $('#completed').prop('checked', bucket.completed);

    // Set selected category
    $('#category').val(bucket.category);

    // Initialize form select
    $('select').formSelect();

    // Set labels to active
    setLabelsActive();
  }

  // Save to local storage
  $("#save_button").click(function () {
    var title = $("#title").val();
    var address = $("#address").val();
    var memos = $("#memos").val();
    var tickets_needed = $("#tickets_needed").prop("checked");
    var completed = $("#completed").prop("checked");
    var budget = $("#budget").val();
    var category = $("#category").val();

    var data = {
      title: title,
      address: address,
      memos: memos,
      tickets_needed: tickets_needed,
      completed: completed,
      budget: budget,
      category: category
    };

    var key = new Date().getTime().toString(); // used to generate a unique key so that each item in local storage has a unique identifier using the current time.

    localStorage.setItem(key, JSON.stringify(data)); // stores the data from var key by converting data to JSON string and sets it in localStorage

    // Append to list
    var item = $("<li>")
      .addClass("collection-item")
      .text(title)
      .attr("data-key", key); // Stores the key in a data attribute

    $("#list_area").append(item);
  });

  // Toggle Budget Field
  $("#budget_toggle").change(function () {
    if (this.checked) {
      $("#budget").show();
    } else {
      $("#budget").hide();
    }
  });
});

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

function populateTitleAndAddress(result) {
  var titleInput = document.getElementById('title');
  var addressInput = document.getElementById('address');

  var title = '';
  var address = '';

  if (result.place_name) {
    title = result.place_name;
    address = result.place_name;
  }

  titleInput.value = title;
  addressInput.value = address;

  // Add 'active' class to labels
  $("label[for='title']").addClass("active");
  $("label[for='address']").addClass("active");

  // Trigger label animation when inputs lose focus
  titleInput.addEventListener('blur', function () {
    if (titleInput.value !== '') {
      $("label[for='title']").addClass("active");
    }
  });

  addressInput.addEventListener('blur', function () {
    if (addressInput.value !== '') {
      $("label[for='address']").addClass("active");
    }
  });
}

function clearAutocompleteDropdown() {
  document.getElementById('autocomplete-dropdown').innerHTML = '';
}
