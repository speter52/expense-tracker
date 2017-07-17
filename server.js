var express  = require('express');
var session  = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var path = require('path');
var app = express();
var port = process.env.PORT || 8080;

var passport = require('passport');
var flash = require('connect-flash');

var dbPool = require('./config/database-pool');


require('./config/passport')(passport, dbPool); // pass passport for configuration

app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

app.set('view engine', 'ejs');

// required for passport
app.use(session({
	secret: 'EXaWsipFDRCni49YlAz5',
	resave: true,
	saveUninitialized: true
 } )); // session secret
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


// routes ======================================================================
require('./app/routes.js')(app, passport, dbPool); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);
