$(document).ready(function() {
  /* global moment */

  // listContainer holds all of our flags
  var listContainer = $(".list-container");
  var flagCategorySelect = $("#category");
  var nameOfCityContainer = $(".city-name");
  //var nameOfCityContainer = $(".name-of-city-container");
  // Click events for the edit and delete buttons
  $(document).on("click", "button.delete", handleFlagDelete);
  $(document).on("click", "button.edit", handleFlagEdit);
  $(document).on("click", "input.up-vote", handleUpVote);
  $(document).on("click", "input.down-vote", handleDownVote);
  // Variable to hold our flags
  var flags;

  // The code below handles the case where we want to get list flags for a specific city
  // Looks for a query param in the url for city_id
  var url = window.location.search;
  var cityId;
  if (url.indexOf("?city_id=") !== -1) {
    cityId = url.split("=")[1];
    getFlags(cityId);
  }
  // If there's no cityId we just get all flags as usual
  else {
    getFlags();
  }


  // This function grabs flags from the database and updates the view
  function getFlags(city) {
    //nameOfCityContainer.append(flag.City.city);
    //nameOfCityContainer.append(City.city);
    cityId = city || "";
    if (cityId) {
      cityId = "/?city_id=" + cityId;
    }
    $.get("/api/flags" + cityId, function(data) {
      console.log("Flags", data);
      flags = data;
      nameOfCityContainer.append(flags[0].City.city);
      if (!flags || !flags.length) {
        displayEmpty(city);
      } else {
        initializeRows();
      }
    });
  }

  // This function does an API call to delete flags
  function deleteFlag(id) {
    $.ajax({
        method: "DELETE",
        url: "/api/flags/" + id
      })
      .done(function() {
        getFlags(flagCategorySelect.val());
      });
  }

  function updateVoteCount(flag) {
    $.ajax({
        method: "PUT",
        url: "/api/flags/",
        data: flag
      })
      .done(function() {
        window.location.href = "/list?city_id=" + flag.CityId;
      });

  }

  // InitializeRows handles appending all of our constructed flag HTML inside listContainer
  function initializeRows() {

    listContainer.empty();
    var flagsToAdd = [];

    //Sort the flags array by voteCount
    flags.sort(function(a, b) {
      return parseFloat(a.voteCount) - parseFloat(b.voteCount);
    });
    flags.reverse();
    //Set the new ranking which depends on the vote count
    for (var j = 0; j < flags.length; j++) {
      flags[j].rank = j + 1;
    }

    for (var i = 0; i < flags.length; i++) {
      flagsToAdd.push(createNewRow(flags[i]));
    }

    listContainer.append(flagsToAdd);
  }

  // This function constructs a flag's HTML
  function createNewRow(flag) {
    var formattedDate = new Date(flag.createdAt);
    formattedDate = moment(formattedDate).format("MMMM Do YYYY, h:mm:ss a");
    var totalFlagPanel = $("<div>");
    var newRankPanel = $("<p>");
    newRankPanel.text(flag.rank);
    newRankPanel.addClass("rank col-md-2");
    var newFlagPanel = $("<span>");
    newFlagPanel.addClass("panel panel-default col-md-10");
    var newFlagPanelHeading = $("<div>");
    newFlagPanelHeading.addClass("panel-heading");
    var deleteBtn = $("<button>");
    deleteBtn.text("x");
    deleteBtn.addClass("delete btn btn-danger");
    var editBtn = $("<button>");
    editBtn.text("EDIT");
    editBtn.addClass("edit btn btn-info");
    var newUpVote = $("<input class='up-vote' type='image' src='https://cdn4.iconfinder.com/data/icons/neutro-award/32/upvote-512.png' width='50' height='50'/>");
    var newDownVote = $("<input class='down-vote' type='image' src='https://cdn4.iconfinder.com/data/icons/neutro-award/32/downvote-512.png' width='50' height='50'/>");

    //var newUpVote = $("<button class='up-vote'><img src='https://cdn4.iconfinder.com/data/icons/neutro-award/32/upvote-512.png' width='50' height='50'></button>");
    //var newDownVote = $("<button class='down-vote'><img src='https://cdn4.iconfinder.com/data/icons/neutro-award/32/downvote-512.png' width='50' height='50'></button>");
    var voteCountPlace = $("<p>");
    if (flag.voteCount === null) {
      flag.voteCount = 0;
      voteCountPlace.text("Votes: " + flag.voteCount);
    } else {
      voteCountPlace.text("Votes: " + flag.voteCount);
    }
    //voteCountPlace.text("Votes: " + flag.voteCount);
    var imagePlace = $("<img>");
    imagePlace.attr("src", flag.image);
    imagePlace.attr("width", '600');
    imagePlace.attr("height", '400');
    var newFlagTitle = $("<h2>");
    var newFlagDate = $("<small>");
    var newFlagCity = $("<h5>");
    newFlagCity.text(flag.City.city);
    newFlagCity.css({
      float: "right",
      color: "blue",
      "margin-top": "-10px"
    });
    var newFlagPanelBody = $("<div>");
    newFlagPanelBody.addClass("panel-body");
    var newFlagBody = $("<p>");
    newFlagTitle.text(flag.title + " ");
    newFlagBody.text(flag.body);
    newFlagDate.text(formattedDate);
    newFlagTitle.append(newFlagDate);
    newFlagPanelHeading.append(newUpVote);
    newFlagPanelHeading.append(newDownVote);
    newFlagPanelHeading.append(voteCountPlace);
    newFlagPanelHeading.append(deleteBtn);
    newFlagPanelHeading.append(editBtn);
    newFlagPanelHeading.append(imagePlace);
    newFlagPanelHeading.append(newFlagTitle);
    newFlagPanelHeading.append(newFlagCity);
    newFlagPanelBody.append(newFlagBody);
    newFlagPanel.append(newFlagPanelHeading);
    newFlagPanel.append(newFlagPanelBody);
    newFlagPanel.data("flag", flag);
    totalFlagPanel.append(newRankPanel);
    totalFlagPanel.append(newFlagPanel);

    return totalFlagPanel;
  }

  //This function figures out which flag we want to down vote and then calls addOneFromDownVoteCount
  function handleUpVote() {
    var currentFlag = $(this)
      .parent()
      .parent()
      .data("flag");
    if (localStorage.getItem(currentFlag.id) === null || localStorage.getItem("vote") === "no") {
      currentFlag.voteCount += 1;

      localStorage.setItem(currentFlag.id, "yes");
      updateVoteCount(currentFlag);
    }
  }
  //This function figures out which flag we want to down vote and then calls subtractOneFromDownVoteCount
  function handleDownVote() {
    var currentFlag = $(this)
      .parent()
      .parent()
      .data("flag");
    if (localStorage.getItem(currentFlag.id) === null || localStorage.getItem("vote") === "no") {
      currentFlag.voteCount -= 1;
      localStorage.setItem(currentFlag.id, "yes");
      updateVoteCount(currentFlag);
    }
  }
  // This function figures out which flag we want to delete and then calls deleteFlag
  function handleFlagDelete() {
    var currentFlag = $(this)
      .parent()
      .parent()
      .data("flag");
    deleteFlag(currentFlag.id);
  }

  // This function figures out which flag we want to edit and takes it to the appropriate url
  function handleFlagEdit() {
    var currentFlag = $(this)
      .parent()
      .parent()
      .data("flag");
    window.location.href = "/cms?flag_id=" + currentFlag.id;
  }

  // This function displays a messgae when there are no flags
  function displayEmpty(id) {
    var query = window.location.search;
    var partial = "";
    if (id) {
      partial = " for City #" + id;
    }
    listContainer.empty();
    var messageh2 = $("<h2>");
    messageh2.css({
      "text-align": "center",
      "margin-top": "50px"
    });
    messageh2.html("No flags yet" + partial + ", navigate <a href='/cms" + query +
      "'>here</a> in order to get started.");
    listContainer.append(messageh2);
  }
});
