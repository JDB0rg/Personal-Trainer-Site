var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var session = require('express-session');
var cors = require('cors');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy
var LocalStrategy = require('passport-local').Strategy;
var keys = require('./keys.js');
var userCtrl = require('./controllers/userCtrl.js');
var dailyCtrl = require('./controllers/dailyCtrl.js');
var feedCtrl = require('./controllers/feedCtrl.js');
var User = require('./models/User.js');
var port = 3000;
var app = express();


///////////////////////////////
//CONNECTING TO THE DATABASE//
/////////////////////////////
mongoose.connect('mongodb://localhost/deenafarmer', function(err) {
  if (err) throw err;
});
mongoose.connection.once('open', function() {
  console.log('Connected to MongoDB');
});


///////////////
//LOGIN AUTH//
/////////////
passport.use('local-login', new LocalStrategy({
  usernameField: 'email'
},
  function(email, password, cb) {
    User.findOne({email: email}, function(err, user) {
      if (err) { return cb(err); }
      if (!user) { return cb(null, false); }
      if (!user.validatePassword(password)) { console.log('password wrong'); return cb(null, false); }
      return cb(null, user);
    });
  }));

  ////////////////
  //SIGNUP AUTH//
  //////////////
  passport.use('local-signup', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
  }, function(req, username, password, done) {
      User.findOne({'username': username}, function(err, user) {
          if (err) return done(err);
          if (user) return done(null, false);
          else {
              var newUser = new User(req.body);
              newUser.password = newUser.generateHash(req.body.password);
              newUser.save(function(err, response) {
                  if (err) return done(null, err);
                  else return done(null, response);
              })
          }
      })
  }))

  passport.serializeUser(function(user, cb) {
      console.log(user);
    cb(null, user.id);
  });

  passport.deserializeUser(function(id, cb) {
    User.findById(id, function (err, user) {
      if (err) { return cb(err); }
      cb(null, user);
    });
  });


///////////////
//MIDDLEWARE//
/////////////
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use(cors());
app.use(session({secret: keys.sessionSecret, resave: false, saveUninitialized: false}));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

/////////////
//AUTH API//
///////////
app.post('/login', passport.authenticate('local-login', {failureRedirect: '/landing'}), function(req, res) {
  res.status(200).send({msg: 'okay!', user: req.session.passport});
})

app.get('/logout', function( req, res ) {
	req.logout();
	req.session.destroy();
    console.log('Logged Out MoFucka');
	res.redirect('/landing');
});

app.post('/signup', passport.authenticate('local-signup', {failureRedirect: '/landing'}), function(req, res) {
    res.status(200).json(req.body);
});


///////////////
//USER API///
////////////
app.post('/api/users', userCtrl.create);
app.get('/api/users/:id', userCtrl.read);
app.put('/api/users/:id', userCtrl.update);


////////////////////
//DAILY API STUFF//
//////////////////
app.post('/api/daily', dailyCtrl.create);
app.get('/api/daily', userCtrl.loggedIn, dailyCtrl.read);
app.delete('/api/daily/:id', dailyCtrl.delete);

///////////////////
//FEED API STUFF//
/////////////////
app.post('/api/feed', feedCtrl.create);
app.get('/api/feed', userCtrl.loggedIn, feedCtrl.read);
app.delete('/api/feed/:id', feedCtrl.delete);





app.listen(port, function() {
  console.log('There\'s a party on port ' + port);
})
