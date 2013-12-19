function Response() {
  this.result = null;
  this.callback = null;
  this.status = 0;
  this.template = '';
  this.content = {};
  this.json = function (result) {
    this.result = result;
    if (this.callback) this.callback();
  };
  this.status = function(status){
    this.status = status;
  };
  this.render = function(template, content){
    this.template = template;
    this.content = content;
  };
  this.setCallback = function(callback) {
    this.callback = callback;
  };
}

Response.prototype.name = 'Response';

module.exports = Response;