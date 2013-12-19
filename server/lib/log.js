var winston = require('winston');
var ENV = process.env.NODE_ENV;
var rootDir = process.cwd().split('/').slice(-1)[0];

function getLogger(module) {
  var path = module.filename.split('/');
  path = path.slice(path.indexOf(rootDir) - path.length + 1).join('/');
  if (ENV === 'test') {
    var fs = require('fs');
    var filename = './.tmp/tests.log';
    fs.writeFileSync(filename, '');
    var stream = fs.createWriteStream(filename);
    return new winston.Logger({
      transports: [
        new winston.transports.File({
          colorize: true,
          level: 'debug',
          label: path,
          stream: stream,
	        json: false
        })
      ]
    });
  } else {
    return new winston.Logger({
      transports: [
        new winston.transports.Console({
          colorize: true,
          level: ENV === 'development' ? 'debug' : 'error',
          label: path
        })
      ]
    });
  }
}

module.exports = getLogger;
