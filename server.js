var express = require('express')
, config = require('./config/config')
, mongoose = require('mongoose');

// Set up db
mongoose.connect(config.db);

// Get models
require('./app/models/user.js');
require('./app/models/group.js');
require('./app/models/message.js');

var openGroups = new Object();
var curid = 1;

var app = express()
, server = require('http').createServer(app)
, io = require('socket.io').listen(server);
io.set('transports', ['websocket', 'xhr-polling']);

// Assume data is good for now, fix bugs later
io.sockets.on('connection', function(socket) {
    socket.on('connect', function(data) {
        var user = new Object();
        Group.findOne({_id: data.group}, function(err, doc) {
            var retval = 0;
            if (!err && doc) {
                user.group = data.group;
                user.id = curid++;
                retval = user.id
                user.name = data.name;
                user.lasttime = Date.now;
                user.socket = socket;
                if (data.lat && data.lon) {
                    user.loc = [data.lon, data.lat];
                }
                if (data.user && data.token) {
                    middleware.auth(req, res, function(success, doc) {
                        if (success)
                        {
                            user.userid = doc._id;
                        }
                    });
                }
                if (openGroups[data.group] === undefined) {
                    openGroups[data.group] = [];
                }
                openGroups[data.group].push(user);
            }
        });
        socket.emit('response', {id: retval}); // 0: error
    });
    socket.on('message', function(data) {
    });
    socket.on('disconnect', function() {
    });
});

require('./config/express')(app, config);
require('./config/routes')(app);
var port = process.env.PORT || 3000;
server.listen(port);
console.log('Express started on port ' + port);
