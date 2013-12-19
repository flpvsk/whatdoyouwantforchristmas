function Request(data, params) {
  this.body = {};
  this.body.data = data;
  this.params = params;
}

Request.prototype.name = 'Request';

module.exports = Request;