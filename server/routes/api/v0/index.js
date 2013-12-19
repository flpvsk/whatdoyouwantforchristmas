module.exports = function (app) {
  require('./users')(app);
  require('./quotes')(app);
};