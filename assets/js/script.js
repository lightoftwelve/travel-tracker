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
        var deleteButton = $('<button>')
          .addClass('btn btn-link delete-button')
          .html('<span class="material-icons">delete</span>');

        item.append(deleteButton); // Append the delete button to the list item

        $("#list_area").append(item);
      }
    } catch (error) {
      console.error('Invalid JSON in localStorage for item key:', key, 'Error:', error.message);
    }
  }

  // Attach the delete button functionality to all delete-button - clears the elements from the list
  $("button[class*='delete-button']").on('click', function () {
    var item = $(this).parent();
    var key = item.attr("data-key");

    var data = JSON.parse(localStorage.getItem(key));
    localStorage.removeItem(key);

    $(item).remove();
  });


  // Updated click function for the list items
  $("#list_area").on("click", ".collection-item", function () {
    var key = $(this).attr("data-key");
    var data = JSON.parse(localStorage.getItem(key));
    console.log(`List area click event: addressLong = ${data.addressLong}, addressLat = ${data.addressLat}`);
    getWeather(data.addressLong, data.addressLat);

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
    clearForm();
    $('#title').val(bucket.title);
    $('#address').val(bucket.address);
    $('#memos').val(bucket.memos);
    $('#budget').val(bucket.budget);

    // set the dates
    $('#start-date').val(bucket.startdate);
    $('#end-date').val(bucket.enddate);

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
    var addressLong = $("#addressLong").val();
    var addressLat = $("#addressLat").val();
    var memos = $("#memos").val();
    var tickets_needed = $("#tickets_needed").prop("checked");
    var completed = $("#completed").prop("checked");
    var budget = $("#budget").val();
    var category = $("#category").val();
    var startdate = $("#start-date").val();
    var enddate = $("#end-date").val();

    var data = {
      title: title,
      address: address,
      addressLong: addressLong,
      addressLat: addressLat,
      memos: memos,
      tickets_needed: tickets_needed,
      completed: completed,
      budget: budget,
      category: category,
      startdate: startdate,
      enddate: enddate
    };

    var key = new Date().getTime().toString(); // used to generate a unique key so that each item in local storage has a unique identifier using the current time.

    localStorage.setItem(key, JSON.stringify(data)); // stores the data from var key by converting data to JSON string and sets it in localStorage

    // Append to list
    var item = $("<li>").addClass("collection-item flex-container").attr("data-key", key);
    var titleElement = $("<span>").addClass("item-text").text(title); // Add 'item-text' class to your title
    var deleteButton = $('<button>').addClass('btn btn-link delete-button').html('<span class="material-icons">delete</span>');

    deleteButton.on('click', function () {
      item.remove(); // Remove the list item from the DOM

      var key = item.attr("data-key"); // Get the key associated with the list item
      localStorage.removeItem(key); // Remove the data from local storage using the key
    });

    item.append(titleElement); // Append the title span to the list item
    item.append(deleteButton); // Append the delete button to the list item
    $("#list_area").append(item);

    clearForm();
  });

  // Toggle Budget Field
  $("#budget_toggle").change(function () {
    if (this.checked) {
      $("#budget").hide();
    } else {
      $("#budget").show();
    }
  });

  $("#refresh_button").on('click', clearForm);

  // clear the form input and the weather & forecast div
  function clearForm() {

    $('#title').val('');
    $('#address').val('');
    $('#memos').val('');
    $('#budget').val('');

    // set the dates
    $('#start-date').val('');
    $('#end-date').val('');

    $('#weather').empty();
    $('#start-date-history').empty();
    $("#tickets_needed").prop("checked", false);
    $("#completed").prop("checked", false);
    $("#category").val('');
  }

  // Calendar: Capture the start and end date of the plan

  // Capture today's date.
  var currentDate = new Date();

  // Initialize the start date picker
  var startDatePicker = $('#start-date').datepicker({
    autoClose: true,
    format: 'mm-dd-yyyy',
    minDate: currentDate,
    onSelect: function (date) {
      // Allow the end date calendar to start one more day than selected start date
      if (date) {
        var startDate = new Date(date);
        startDate.setDate(startDate.getDate() + 1);
        updateEndDatePicker(startDate);
      }
    }
  }).on('change', function () {
    // For any change in the start date, update the end date picker
    var startDate = new Date($(this).val());
    if (startDate && !isNaN(startDate.getTime())) {
      startDate.setDate(startDate.getDate() + 1);
      updateEndDatePicker(startDate);
    } else {
      endDatePicker.prop('disabled', true).val('');
    }
  });

  // Start the end date picker disabled for input
  var endDatePicker = $('#end-date').prop('disabled', true);

  // Initialize the end date picker based on the date thats passed, and enable the date picker input box
  function updateEndDatePicker(date) {

    if (endDatePicker.initialized) {
      endDatePicker.datepicker('destroy');
    }
    // Initialize the end date picker with the calendar starting from the date (Start Date) that is selected
    endDatePicker.datepicker({
      autoClose: true,
      format: 'mm-dd-yyyy',
      minDate: date
    });

    // Enable the end date input box 
    endDatePicker.prop('disabled', false);
    endDatePicker.initialized = true;

    // Change the end date, if the start date is beyond end date
    var endDate = new Date($(endDatePicker).val());
    if (date > endDate) {
      $(endDatePicker).val(dayjs(date).format('MM-DD-YYYY'));
    }
  }

});

setTimeout(() => {
  $('#loading').addClass('hidden');
  $('.lazyLoadContainer').removeClass('hidden');
  setTimeout(() => {
    window.dispatchEvent(new Event('resize'));
  }, 0);
}, 1000);