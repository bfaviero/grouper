var express = require('express')
, config = require('./config/config')
, mongoose = require('mongoose');

// Set up db
mongoose.connect(config.db);

// Get models
require('./app/models/user.js');
require('./app/models/group.js');
require('./app/models/message.js');


var app = express()
, server = require('http').createServer(app)
, io = require('socket.io').listen(server);

require('./config/express')(app, config);
require('./config/routes')(app);
var port = process.env.PORT || 3000;
server.listen(port);
console.log('Express started on port ' + port);
