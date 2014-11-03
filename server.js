var path = require('path');
var express = require('express');
var app = express();
var port = 3010;
app.use('/', express.static(path.join(__dirname, "app")));

app.listen(port);
console.log('Listening on port %s', port);