require('newrelic');

var express = require('express'),
    path = require('path'),
    api = require('./api'),
    reports = require('./reports'),
    app = express();

app.use(express.logger())
  .use(express.compress())
  .use(express.methodOverride())
  .use(express.bodyParser());

if (process.env.NODE_ENV === 'DEV') {
  // STATIC
  app.use(express.static(path.join(__dirname, '../client/app')))
     .use(express.static(path.join(__dirname, '../client/.tmp')));
}

if (process.env.NODE_ENV === 'production') {
  // STATIC
  app.use(express.static(path.join(__dirname, '../client/dist')));
}

// API
app.use('/api', api);


// REPORTS
app.use('/reports', reports);

app.listen(process.env.PORT || 3000);
