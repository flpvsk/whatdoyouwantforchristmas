var express = require('express'),
    path = require('path'),
    api = require('./api'),
    app = express();

app.use(express.bodyParser())
  // STATIC
  .use(express.static(path.join(__dirname, '../client/app')))
  .use(express.static(path.join(__dirname, '../client/.tmp')))
  // API
  .use('/api', api);


app.listen(process.env.PORT || 3000);
