var mongoose = require('mongoose');
var Status = require('../models/Feed.js');

module.exports = {
  create: function(req, res, next) {
    req.body.user = req.user;
    var status = new Status(req.body);
    status.save(function(err, response) {
      if (err) res.status(500).json(err);
      else return res.status(200).json(response);
    })
  },
  read: function(req, res, next) {
    var query = {};
    Status.find(query, function(err, response) {
      if (err) res.status(500).json(err);
      else res.status(200).json(response);
    })
  },
  delete: function(req, res, next) {
    var id = req.params.id;
    Status.findByIdAndRemove(id, function(err, response) {
      if (err) res.status(500).json(err);
      else res.status(200).json(response);
    })
  }
}
