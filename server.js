var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var userCtrl = require('./controllers/userCtrl.js');
var dailyCtrl = require('./controllers/dailyCtrl.js');
var port = 3000;
var app = express();


//connecting to the database
mongoose.connect('mongodb://localhost/deenafarmer', function(err) {
  if (err) throw err;
});
mongoose.connection.once('open', function() {
  console.log('Connected to MongoDB');
});


//middleware
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

//user API stuff
app.post('/api/users', userCtrl.create);

//daily API stuff
app.post('/api/daily', dailyCtrl.create);
app.get('/api/daily', dailyCtrl.read);

app.listen(port, function() {
  console.log('Listening on port ' + port);
  console.log('All clear, Captain!');
})
