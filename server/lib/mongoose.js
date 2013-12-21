var mongoose = require('mongoose'),
    log = require('./log')(module),
    config = require('../config'),
    mongoStore = require('./mongoStore');

var uri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || config.get('mongoose:uri');

module.exports = mongoose;

var connectTimeout, closeTimeout;
function connect() {
  mongoose.connect(uri, config.get('mongoose:options'), function (err) {
    log.info('Try to connect to MongoDB');
    if (err) {
      log.error(err.message);
      if (closeTimeout) {
        clearTimeout(closeTimeout);
        closeTimeout = null;
      }
      connectTimeout = setTimeout(connect, 2000);
    } else {
      mongoose.connection.on('close', function () {
        log.error('Connection to MongoDB was closed');
        mongoose.readyState = 0;
        if (connectTimeout) {
          clearTimeout(connectTimeout);
          connectTimeout = null;
        }
        closeTimeout = setTimeout(connect, 2000);
      });
      mongoose.connection.on('error', function (err) {
        log.error(err.stack);
      });
      mongoose.connection.on('open', function () {
        if (connectTimeout) {
          clearTimeout(connectTimeout);
          connectTimeout = null;
        }
        if (closeTimeout) {
          clearTimeout(closeTimeout);
          closeTimeout = null;
        }
        log.info('Connection to MongoDB was opened');
        mongoose.readyState = 1;
        try {
          mongoStore.getMongoStore().collection = null;
        } catch (err) {
          log.error(err.stack);
        }
      });
    }
  });
}

connect();