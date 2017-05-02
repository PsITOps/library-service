var express = require('express'),
  path = require('path'),
  logger = require('morgan'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  morganResolver = require('./lib/util/morgan-resolver'),
  db = require('./lib/db'),
  app = express();

require('./config/setup')(__dirname);

db.connect();

app.use(morganResolver());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());

// setups routes
require('./lib/routes/setup')(app);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = {};
  err.status = 404;
  err.message = "The resource was not found"
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);

  res.json(err);

});

module.exports = app;