var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var fb = require('./utilities/config.js');
var ppUtils = require('./utilities/passportUtils.js');
var path = require('path');
var requesthandler = require('./requesthandler.js');
var User = require('./models/user.js');

//initializing Passport with FB OAuth
passport.use(new FacebookStrategy({
    clientID: fb.fbAppId,
    clientSecret: fb.secret,
    callbackURL: 'http://localhost:3000/login/facebook/callback',
  }, requesthandler.passportAuth));

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(cors());
app.use(require('cookie-parser')());
app.use(require('express-session')({secret: 'keyboard cat', resave: true, saveUninitialized: true}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/', ppUtils.isLoggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, '/../react-client/dist'));
});

app.use(express.static(__dirname + '/../react-client/dist'));

passport.serializeUser((user, done) => {
  // user is returned as an object within an array
  if (user) {
    done(null, user[0].accessToken);
  } else {
    done(null, 'first time user');
  }
});

passport.deserializeUser((obj, cb) => {
  cb(null, obj);
});

app.post('/train', function(req, res) {
  console.log('body: ', req.body);
  res.send('received form data');
});

app.get('/login/facebook',
  passport.authenticate('facebook'));

app.get('/login/facebook/callback', 
  passport.authenticate('facebook', { failureRedirect: '/login',
    successRedirect: '/'
  })
);

app.get('/init', requesthandler.init);

app.options('*', cors());

app.get('/getWines', requesthandler.getWines);
app.post('/search', requesthandler.search);
app.post('/review', requesthandler.review);
app.post('/reviews', requesthandler.reviews);

var port = process.env.PORT || 3000;

app.listen(port, function() {
  console.log('listening to port ' + port);
});
