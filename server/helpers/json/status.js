function Status(code, name) {
  this.code = code;
  this.name = name;
}

Status.prototype.name = 'Status';

module.exports.S200 = S200 = new Status(200, 'OK');
module.exports.S400 = S400 = new Status(400, 'Bad Request');
module.exports.S500 = S500 = new Status(500, 'Internal server error');

module.exports.S201 = S201 = new Status(201, 'Created');
module.exports.S304 = S304 = new Status(304, 'Not Modified');
module.exports.S404 = S404 = new Status(404, 'Not Found');
module.exports.S401 = S401 = new Status(401, 'Unauthorized');
module.exports.S403 = S403 = new Status(403, 'Forbidden');

module.exports.statusByCode = function (code) {
  switch (code) {
    case 200:
      return S200;
    case 400:
      return S400;
    case 500:
      return S500;
    case 201:
      return S201;
    case 304:
      return S304;
    case 404:
      return S404;
    case 401:
      return S401;
    case 403:
      return S403;
  }
};