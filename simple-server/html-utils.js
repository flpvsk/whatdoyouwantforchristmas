var htmlparser = require('htmlparser2')
    Q = require('q');

module.exports.getTitle = function (html) {
  var q = Q.defer(),
      title = { found: false, text: '' },
      parser;

  parser = new htmlparser.Parser({
    onopentag: function (name, attribs) {
      if (title.parsed) { return; }
      if (name === "title") { title.found = true; }
    },

    ontext: function (text) {
      if (title.found) { title.text += text; }
    },

    onclosetag: function (name) {
      if (name === "title") {
        title.parsed = true;
        q.resolve(title.text);
      }
    }

  });

  parser.write(html);
  parser.end();

  return q.promise;
};
