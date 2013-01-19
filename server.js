var express = require('express')
, config = require('./config/config')
, mongoose = require('mongoose');

// Set up db
mongoose.connect(config.db);

// Get models
require('./app/models/user.js');
require('./app/models/group.js');
require('./app/models/message.js');

var clients = new Object();

var app = express()
, server = require('http').createServer(app)
, io = require('socket.io').listen(server);
io.set('transports', ['websocket', 'xhr-polling']);

// Assume data is good for now, fix bugs later
io.sockets.on('connection', function(socket) {
    socket.on('connect', function(data) {
        var user = new Object();
        Group.findOne({_id: data.group}, function(err, doc) {
            var retval = -1;
            if (!err && doc) {
                user.group = data.group;
                user.name = data.name;
                user.lasttime = Date.now;
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
                clients[socket.id] = user;
                socket.join(user.group);
                retval = user.id
            }
        });
        socket.emit('connectresponse', {id: retval}); // -1: error
    });
    socket.on('message', function(data) {
        Group.findOne({_id: req.body.group}, function(err, doc) {
            if (!err & doc) {
                var bad = false;
                var message = new Message();
                message._group = doc._id;
                message.username = data.username;
                message.body = data.body;
                message.type = data.type;
                if (data.lat && !isNaN(data.lat) && data.lon && !isNaN(data.lon)) {
                    message.loc = [Number(data.lon), Number(data.lat)];
                }
                if (data.userid && data.token) {
                    middleware.auth(req, res, function(success, doc2) {
                        if (success) {
                            message._user = doc2._id;
                        }
                        else {
                            bad = true;
                        }
                    });
                }
                if (!bad) {
                    var ret = 0;
                    message.save(function (err) {
                        if (err) {
                            console.log(err)
                            socket.emit('messageresponse', {success: false});
                        }
                        else {
                            io.sockets.in(data.group).emit(message.toJSON());
                            clients[socket.id].lasttime = Date.now;
                            socket.emit('messageresponse', {success: true});
                        }
                    });
                }
                else {
                    socket.emit('messageresponse', {success: false});
                }
            }
        });
    });
    socket.on('disconnect', function() {
        // socket.leave already called
        delete clients[socket.id];
    });
    // Need to geolocate chat room members
});

require('./config/express')(app, config);
require('./config/routes')(app);
var port = process.env.PORT || 3000;
server.listen(port);
console.log('Express started on port ' + port);
