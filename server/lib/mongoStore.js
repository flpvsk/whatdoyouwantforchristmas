var mongoStore;

module.exports.createMongoStore = function(express, mongoose) {
  var MongoStore = require('connect-mongo')(express);
  mongoStore =  new MongoStore({db: mongoose.connection.db});
  return mongoStore;
};

module.exports.getMongoStore = function() {
  return mongoStore;
};