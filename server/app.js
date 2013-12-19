var express = require('express'),
    http = require('http'),
    path = require('path'),
    config = require('./config'),
    log = require('./lib/log')(module),
    HttpError = require('./error').HttpError;

var app = express();

// all environments
app.set('port', process.env.PORT || config.get('port'));
var ENV = app.get('env');

if ('production' === ENV) {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.use(express.logger('default'));
  app.set('views', __dirname + '/dist');
} else {
  app.use(express.static(path.join(__dirname, '../client')));
  app.use(express.logger('dev'));
  app.set('views', __dirname + '/client');
}

app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.methodOverride());

var mongoose = require('./lib/mongoose'),
    mongoStore = require('./lib/mongoStore');
var store = mongoStore.createMongoStore(express, mongoose);

app.use(express.session({
  secret: config.get('session:secret'),
  key: config.get('session:key'),
  cookie: config.get('session:cookie'),
  store: store
}));

app.use(require('./middleware/loadUser'));
app.use(require('./middleware/sendHttpError'));
app.use(app.router);

require('./routes')(app);

app.use(appErrorHandler());

function appErrorHandler() {
  return function (err, req, res, next) {
    if (typeof err === 'number') {
      err = new HttpError(err);
    }
    if (err instanceof HttpError && res) {
      res.sendHttpError(err);
    } else {
      if (res) {
        log.error(err.message, err);
        err = new HttpError(500);
        res.sendHttpError(err);
      } else {
        log.error(err.stack);
      }
    }
  };
}

process.on('uncaughtException', function (err) {
  log.error('Uncaught Exception: ' + err.message);
  log.error(err.stack);
});

http.createServer(app).listen(app.get('port'), function () {
  log.info('Express server listening on port ' + app.get('port'));
});