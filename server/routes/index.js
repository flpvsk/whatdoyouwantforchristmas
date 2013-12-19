var auth = require('./auth'),
    checkDB = require('../middleware/checkDB');

module.exports = function (app) {
  require('./api/v0')(app);

  app.post('/signin', checkDB, auth.signIn);
  app.post('/signout', checkDB, auth.signOut);
};