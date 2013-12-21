module.exports = function (app) {
  require('./users')(app);
  require('./wishlist')(app);
};