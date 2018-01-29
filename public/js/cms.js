$(document).ready(function() {
  // Getting jQuery references to the flag body, title, image, form, and city select
  var bodyInput = $("#body");
  var titleInput = $("#title");
  var imageInput = $("#image");
  var cmsForm = $("#cms");
  var citySelect = $("#city");
  var imgPreview=document.getElementById("img-preview");
  var fileUpload=document.getElementById("image");

  imageInput.change( function(event) {

    var CLOUDINARY_URL='https://api.cloudinary.com/v1_1/dusk3vxok/upload';
    var CLOUDINARY_UPLOAD_PRESET ='atkac9rd';

      var file= event.target.files[0];
      var formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    axios({
      url: CLOUDINARY_URL,
      method:'POST',
      headers:{
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data:formData
    }).then(function(res){
      console.log(res);
      imgPreview.src = res.data.secure_url;
    }).catch(function(err){
      console.log(err);
    })


    $("img").attr('src',URL.createObjectURL(event.target.files[0]));
  });

  // Adding an event listener for when the form is submitted
  $(cmsForm).on("submit", handleFormSubmit);
  // Gets the part of the url that comes after the "?" (which we have if we're updating a flag)
  var url = window.location.search;
  var flagId;
  var cityId;
  // Sets a list for whether or not we're updating a flag to be false initially
  var updating = false;

  // If we have this section in our url, we pull out the flag id from the url
  // In '?flag_id=1', flagId is 1
  if (url.indexOf("?flag_id=") !== -1) {
    flagId = url.split("=")[1];
    getFlagData(flagId, "flag");
  }
  // Otherwise if we have a city_id in our url, preset the city select box to be our City
  else if (url.indexOf("?city_id=") !== -1) {
    cityId = url.split("=")[1];
  }

  // Getting the cities, and their flags
  getCities();

  // A function for handling what happens when the form to create a new flag is submitted
  function handleFormSubmit(event) {
    event.preventDefault();
    // Wont submit the flag if we are missing a body, title, or city
    if (!titleInput.val().trim() || !bodyInput.val().trim() || !citySelect.val()) {
      return;
    }



    // Constructing a newFlag object to hand to the database
    var newFlag = {
      title: titleInput
        .val()
        .trim(),
      image: imgPreview.src
          // .val()
          .trim(),
      body: bodyInput
        .val()
        .trim(),
      CityId: citySelect.val()
    };

    // If we're updating a flag run updateFlag to update a flag
    // Otherwise run submitFlag to create a whole new flag
    if (updating) {
      newFlag.id = flagId;
      updateFlag(newFlag);
    }
    else {
      submitFlag(newFlag);
    }
  }









  // Submits a new flag and brings user to list page upon completion
  function submitFlag(flag) {



    $.post("/api/flags", flag, function() {
      window.location.href = "/list?city_id=" + flag.CityId;
    });
  }

  // Gets flag data for the current flag if we're editing, or if we're adding to an city's existing flags
  function getFlagData(id, type) {
    var queryUrl;
    switch (type) {
      case "flag":
        queryUrl = "/api/flags/" + id;
        break;
      case "city":
        queryUrl = "/api/cities/" + id;
        break;
      default:
        return;
    }
    $.get(queryUrl, function(data) {
      if (data) {
        console.log(data.CityId || data.id);
        // If this flag exists, prefill our cms forms with its data
        titleInput.val(data.title);
        imageInput.val(data.image);
        bodyInput.val(data.body);
        cityId = data.id;
        // If we have a flag with this id, set a list for us to know to update the flag
        // when we hit submit
        updating = true;
      }
    });
  }

  // A function to get Cities and then render our list of Cities
  function getCities() {
    $.get("/api/cities", renderCityList);
  }
  // Function to either render a list of cities, or if there are none, direct the user to the page
  // to create an city first
  function renderCityList(data) {
    if (!data.length) {
      window.location.href = "/cities";
    }
    $(".hidden").removeClass("hidden");
    var rowsToAdd = [];
    for (var i = 0; i < data.length; i++) {
      rowsToAdd.push(createCityRow(data[i]));
    }


    citySelect.empty();
    console.log(rowsToAdd);
    console.log(citySelect);
    citySelect.append(rowsToAdd);
    citySelect.val(cityId);
  }

  // Creates the city options in the dropdown
  function createCityRow(city) {
    var listOption = $("<option>");
    listOption.attr("value", city.id);
    listOption.text(city.city);
    return listOption;
  }

  // Update a given flag, bring user to the list page when done
  function updateFlag(flag) {
    $.ajax({
      method: "PUT",
      url: "/api/flags",
      data: flag
    })
    .done(function() {
      window.location.href = "/list";
    });
  }
});
