$(document).ready(function() {
  // Getting references to the name inout and city container, as well as the table body
  var nameInput = $("#city-name");
  var cityList = $("tbody");
  var cityContainer = $(".city-container");
  // Adding event listeners to the form to create a new object, and the button to delete
  // an City
  $(document).on("submit", "#city-form", handleCityFormSubmit);
  $(document).on("click", ".delete-city", handleDeleteButtonPress);

  // Getting the intiial list of Cities
  getCities();

  // A function to handle what happens when the form is submitted to create a new City
  function handleCityFormSubmit(event) {
    event.preventDefault();
    // Don't do anything if the name fields hasn't been filled out
    if (!nameInput.val().trim().trim()) {
      return;
    }
    // Calling the upsertCity function and passing in the value of the name input
    upsertCity({
      name: nameInput
        .val()
        .trim()
    });
  }

  // A function for creating a city. Calls getCities upon completion
  function upsertCity(cityData) {
    $.post("/api/cities", cityData)
      .then(getCities);
  }

  // Function for creating a new list row for cities
  function createCityRow(cityData) {
    var newTr = $("<tr>");
    newTr.data("city", cityData);
    newTr.append("<td>" + cityData.id + "</td>");
    newTr.append("<td>" + cityData.city + "</td>");
    newTr.append("<td>" + cityData.state + "</td>");
    newTr.append("<td> " + cityData.Flags.length + "</td>");
    newTr.append("<td><a href='/list?city_id=" + cityData.id + "'>Go to Flags</a></td>");
    newTr.append("<td><a href='/cms?city_id=" + cityData.id + "'>Create a Flag</a></td>");
    return newTr;
  }

  // Function for retrieving cities and getting them ready to be rendered to the page
  function getCities() {
    $.get("/api/cities", function(data) {
      var rowsToAdd = [];
      for (var i = 0; i < 20; i++) {
        rowsToAdd.push(createCityRow(data[i]));
      }
      renderCityList(rowsToAdd);
      nameInput.val("");
    });
  }

  $(".pagination").on('click', 'a', function() {
    

    /*
    N.B. UI-driven pagination

    $.get('/api/cities', function(data) {
      // N.B. Another way to make "rows"
      //
      // var page = data.slice(start, end);
      // var rows = page.map(createCityRow);
      //
      var rows = [ ]; 
      for (var i = start; i < end; i++) {
        rows.push(createCityRow(data[i]));
      }

      renderCityList(rows);
    });
    */
    var $this = parseInt($(this).text()) -1;
    var pageLength = 20; 
    
    var start = $this * pageLength; 
    var end   = start + pageLength;
    
    // $.get("/api/cities", function(data) {
    $.get("/api/pages/" + start + "/" + end + "/", function(data) {
      // console.log(data)
      var rowsToAdd = [];
      for (var i = 0; i < data.length; i++) {
        rowsToAdd.push(createCityRow(data[i]));
      };
  
      // console.log(rowsToAdd)
      renderCityList(rowsToAdd);
      nameInput.val("");
    });
  })

  // A function for rendering the list of cities to the page
  function renderCityList(rows) {
    cityList.children().not(":last").remove();
    cityContainer.children(".alert").remove();
    if (rows.length) {
      console.log(rows);
      cityList.prepend(rows);
    }
    else {
      renderEmpty();
    }
  }

  // Function for handling what to render when there are no cities
  function renderEmpty() {
    var alertDiv = $("<div>");
    alertDiv.addClass("alert alert-danger");
    alertDiv.html("You must create an City before you can create a Flag.");
    cityContainer.append(alertDiv);
  }

  // Function for handling what happens when the delete button is pressed
  function handleDeleteButtonPress() {
    var listItemData = $(this).parent("td").parent("tr").data("city");
    var id = listItemData.id;
    $.ajax({
      method: "DELETE",
      url: "/api/cities/" + id
    })
    .done(getCities);
  }
});
