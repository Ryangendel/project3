// *********************************************************************************
// api-routes.js - this file offers a set of routes for displaying and saving data to the db
// *********************************************************************************

// Dependencies
// =============================================================

// Requiring our models
var db = require("../models");

// Routes
// =============================================================
module.exports = function(app) {

  // GET route for getting all of the flags
  app.get("/api/flags", function(req, res) {
    var query = {};
    if (req.query.city_id) {
      query.CityId = req.query.city_id;
    }
    // Here we add an "include" property to our options in our findAll query
    // We set the value to an array of the models we want to include in a left outer join
    // In this case, just db.City
    db.Flag.findAll({
      where: query,
      include: [db.City]
    }).then(function(dbFlag) {
      res.json(dbFlag);
    });
  });

  // Get rotue for retrieving a single flag
  app.get("/api/flags/:id", function(req, res) {
    // Here we add an "include" property to our options in our findOne query
    // We set the value to an array of the models we want to include in a left outer join
    // In this case, just db.City
    db.Flag.findOne({
      where: {
        id: req.params.id
      },
      include: [db.City]
    }).then(function(dbFlag) {
      res.json(dbFlag);
    });
  });

  // POST route for saving a new flag
  app.post("/api/flags", function(req, res) {
    db.Flag.create(req.body).then(function(dbFlag) {
      res.json(dbFlag);
    });
  });

  // DELETE route for deleting flags
  app.delete("/api/flags/:id", function(req, res) {
    db.Flag.destroy({
      where: {
        id: req.params.id
      }
    }).then(function(dbFlag) {
      res.json(dbFlag);
    });
  });

  // PUT route for updating flags
  app.put("/api/flags", function(req, res) {
    db.Flag.update(
      req.body,
      {
        where: {
          id: req.body.id
        }
      }).then(function(dbFlag) {
        res.json(dbFlag);
      });
  });
};
