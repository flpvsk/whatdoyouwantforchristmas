var express = require('express'),
    path = require('path'),
    app = express();

app.use(express.static(path.join(__dirname, '../client/app')))
  .use(express.static(path.join(__dirname, '../client/.tmp')));


app.listen(process.env.PORT || 3000);
