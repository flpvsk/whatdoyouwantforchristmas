var User = require('../../../models/user'),
    arrayRest = require('../../../controllers/api/v0/nestedArrayRest')(User, 'quotes'),
    checkDB = require('../../../middleware/checkDB');

module.exports = function (app) {
  app.get('/api/v0/users/:id/quotes', checkDB, arrayRest.get);
  app.post('/api/v0/users/:id/quotes', checkDB, arrayRest.post);
  app.put('/api/v0/users/:id/quotes/:value', checkDB, arrayRest.put);
  app.delete('/api/v0/users/:id/quotes/:value', checkDB, arrayRest.delete);
};