var express = require('express')
, config = require('./config/config')
, mongoose = require('mongoose');

// Set up db
mongoose.connect(config.db);

// Get models
require('./app/models/user.js');
require('./app/models/group.js');
require('./app/models/message.js');
var Group = mongoose.model('Group');
var Message = mongoose.model('Message');

var clients = new Object();

var app = express()
, server = require('http').createServer(app)
, io = require('socket.io').listen(server);
io.set('transports', ['websocket', 'xhr-polling']);
require('./config/express')(app, config);
require('./config/routes')(app);

// Assume data is good for now, fix bugs later
io.sockets.on('connection', function(socket) {
    socket.on('connect', function(data) {
        var user = new Object();
        var retval = -1;
        console.log("data:");
        console.log(data);
        Group.findOne({_id: data.group}, function(err, doc) {
            if (!err && doc) {
                if (!(doc.pin && doc.pin.length) || (data.pin && doc.pin === data.pin)) {
                    var message = new Message();
                    user.group = data.group;
                    message._group = user.group;
                    user.name = data.name;
                    message.username = user.name;
                    user.lasttime = new Date(Date.now());
                    if (data.lat && data.lon) {
                        user.loc = [data.lon, data.lat];
                        message.loc = [Number(data.lon), Number(data.lat)];
                    }
                    if (data.user && data.token) {
                        middleware.auth(req, res, function(success, doc) {
                            if (success)
                            {
                                user.userid = doc._id;
                                message._user = user.userid;
                            }
                        });
                    }
                    console.log(user);
                    clients[socket.id] = user;
                    socket.join(data.group);
                    retval = socket.id
                    
                    message.body = message.username + " has joined this chat.";
                    message.type = 'text';

                    io.sockets.in(user.group).emit('message', message.toJSON());
                }
                else {
                    console.log(data);
                    console.log("invalid pin");
                    if (doc.pin) {
                        console.log("doc: "+doc.pin);
                    }
                    if (data.pin) {
                        console.log("doc: "+data.pin);
                    }
                    console.log("invalid pin");
                }
            }
            console.log(retval);
            socket.emit('connectresponse', {id: retval}); // -1: error
        });
    });
    socket.on('message', function(data) {
        if (clients[socket.id]) {
            Group.findOne({_id: data.group}, function(err, doc) {
                if (!err && doc) {
                    console.log("good message");
                    var bad = false;
                    var message = new Message();
                    message._group = doc._id;
                    message.username = data.name;
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
                                io.sockets.in(data.group).emit('message', message.toJSON());
                                clients[socket.id].lasttime = Date.now();
                                socket.emit('messageresponse', {success: true});
                            }
                        });
                    }
                    else {
                        socket.emit('messageresponse', {success: false});
                    }
                }
            });
        }
    });
    socket.on('remove', function() {
        // socket.leave already called
        socket.leave(clients[socket.id].group);
        socket.removeListener(clients[socket.id].group, function(data) {console.log(data)});
        delete clients[socket.id];
    });
    socket.on('disconnect', function() {
        delete clients[socket.id]; // memory leak?
    });
    // Need to geolocate chat room members
});

var port = process.env.PORT || 3000;
server.listen(port);
console.log('Express started on port ' + port);
