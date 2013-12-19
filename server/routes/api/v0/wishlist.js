var User = require('../../../models/user'),
    arrayRest = require('../../../controllers/api/v0/nestedArrayRest')(User, 'wishlist'),
    checkDB = require('../../../middleware/checkDB');

module.exports = function (app) {
  app.get('/api/v0/users/:id/wishlist', checkDB, arrayRest.get);
  app.post('/api/v0/users/:id/wishlist', checkDB, arrayRest.post);
  app.put('/api/v0/users/:id/wishlist/:value', checkDB, arrayRest.put);
  app.delete('/api/v0/users/:id/wishlist/:value', checkDB, arrayRest.delete);
};