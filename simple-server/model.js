var request = require('request'),
    Q = require('q'),
    htmlUtils = require('./html-utils'),
    db = require('./db'),
    log = require('./log'),
    URL_PATTERN = new RegExp(
      '^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator


module.exports.wish = {};

module.exports.wish.parse = function parseWish(wish) {
  wish.userId = db.id(wish.userId);

  wish.removed = !!wish.removed;
  if (wish._id) { wish._id = db.id(wish._id); }
  if (URL_PATTERN.test(wish.descr) && !wish.address) {
    log.debug('Wish is URL, %s', wish);

    return Q.nfcall(request, wish.descr)
      .spread(function (res, body) {
        return htmlUtils.getTitle(body);
      })
      .then(function (title) {
        wish.address = wish.descr;
        wish.descr = title;
        wish.type = 'link';
        return wish;
      });
  }

  return Q.when(wish);
}

