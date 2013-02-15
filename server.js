var express = require('express')
, config = require('./config/config')
, mongoose = require('mongoose');

// Set up db
mongoose.connect(config.db);

// Get models
require('./app/models/user.js');
require('./app/models/group.js');
require('./app/models/message.js');
//room model
var Group = mongoose.model('Group');
//message model
var Message = mongoose.model('Message');
//Client object
var clients = new Object();

var app = express()
, server = require('http').createServer(app)
, io = require('socket.io').listen(server);
io.set('transports', ['websocket', 'xhr-polling']);
require('./config/express')(app, config);
require('./config/routes')(app, io);

// Assume data is good for now, fix bugs later
// initial connection from a client. socket argument should be used in further communication with the client.
io.sockets.on('connection', function(socket) {
    //"connect" is emitted when the socket connected successfully
    socket.on('connect', function(data) {
        //user object
        var user = new Object();
        var retval = -1;
        console.log("data:");
        console.log(data);
        //find a group by the ID used in the connection
        Group.findOne({_id: data.group}, function(err, doc) {
            //If there is no error and the doc is not empty
            if (!err && doc) {
                //if the pin and pin length aren't empy, or pin is not empty and dot pin == data pin
                if (!(doc.pin && doc.pin.length) || (data.pin && doc.pin === data.pin)) {
                    //Initialize a new Message model object
                    var message = new Message();
                    //group attribute in message set to data group
                    message._group = data.group
                    //name attribute in user set to data.name
                    user.name = new String(data.name);
                    //message username attribute set to user.name
                    message.username = user.name
                    //lasttime a user was active set to now
                    user.lasttime = new Date(Date.now());
                    //If we hate a lat and lon
                    if (data.lat && data.lon) {
                        //set that info to the user's lat and lon
                        user.loc = [data.lon, data.lat];
                        //The message location is also set to the user's location
                        message.loc = [Number(data.lon), Number(data.lat)];
                    }
                    //If we have a user and a token
                    if (data.user && data.token) {
                        //auth the user
                        middleware.auth(req, res, function(success, doc) {
                            //if auth is succesful
                            if (success)
                            {
                                //set user.userid and message._user
                                user.userid = doc._id;
                                message._user = user.userid;
                            }
                        });
                    }
                    console.log(user);
                    //Set the user as a client, according to the ID of the econnection
                    clients[socket.id] = user;
                    //Rooms manager: this socket.ID points to a room
                    var rooms = io.sockets.manager.roomClients[socket.id];
                    var bad = false;
                    //for all rooms currently active
                    for(room in rooms)
                    {
                        //not sure what this does
                        if (room.substring(1) == data.group)
                        {
                            bad = true;
                            break;
                        }
                    }
                    //but if we don't have any bad rooms! do this.
                    if (!bad)
                    {
                        //Join the room!
                        socket.join(data.group);
                        //set the message ID to be that of the room
                        message.socketid = socket.id;
                        //retval is socket ID
                        retval = socket.id
                        //set initial message attributes
                        message.body = user.name + " has joined this chat.";
                        message.type = 'text';
                        console.log("message");
                        console.log(message.toJSON());
                        //emit the message IN the current group
                        io.sockets.in(data.group).emit('message', message.toJSON());
                    }
                    //if nothing is bad, we've already tried to connect
                    else
                    {
                        console.log("already tried to connect");
                    }
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
    //"message" is emitted when a message sent with socket.send is received. 
    socket.on('message', function(data) {
        //IF the group is valid/sent with the message
        if (data.group && data.group.indexOf("|") > -1)
        {
            //initialize the data to contain the message contents
            var message = new Message();
            message._group = data.group;
            message.username = data.name;
            message.body = data.body;
            message.type = data.type;

            message.socketid = socket.id;
            //if the latlon is valid, set it
            if (data.lat && !isNaN(data.lat) && data.lon && !isNaN(data.lon)) {
                message.loc = [Number(data.lon), Number(data.lat)];
            }
            //emit the message in the current group
            io.sockets.in(data.group).emit('message', message.toJSON());
        }
        //else find the user
        else if (clients[socket.id]) {
            //find the group by the ID
            Group.findOne({_id: data.group}, function(err, doc) {
                //if the message is good
                if (!err && doc) {

                    console.log("good message");
                    var bad = false;
                    var message = new Message();
                    //set the message attributes
                    message._group = doc._id;
                    message.username = data.name;
                    message.body = data.body;
                    message.type = data.type;
                    message.socketid = socket.id;
                    if (data.lat && !isNaN(data.lat) && data.lon && !isNaN(data.lon)) {
                        message.loc = [Number(data.lon), Number(data.lat)];
                    }
                    if (data.userid && data.token) {
                        //auth the user
                        middleware.auth(req, res, function(success, doc2) {
                            if (success) {
                                message._user = doc2._id;
                            }
                            else {
                                bad = true;
                            }
                        });
                    }
                    //if auth is successful
                    if (!bad) {
                        var ret = 0;    
                        message.save(function (err) {
                            if (err) {
                                console.log(err)
                                io.sockets.in(doc._id).emit('messageresponse', {success: false});
                            }
                            else {
                                io.sockets.in(doc._id).emit('message', message.toJSON());
                                clients[socket.id].lasttime = Date.now();
                                io.sockets.in(doc._id).emit('messageresponse', {success: true});
                            }
                        });
                    }
                    else {
                        io.sockets.in(doc._id).emit('messageresponse', {success: false});
                    }
                }
            });
        }
    });
    //a request!
    socket.on('request', function(data) {
        console.log("YAY REQUEST");
        console.log(data);
        var to = io.sockets.sockets[data.to];
        if (to)
        {
            var room = "|"+socket.id+data.to;
            socket.join(room);
            to.join(room);
            to.emit('requestreply', {success: true, room: room, name: clients[socket.id].name});
            socket.emit('requestreply', {success: true, room: room, name: clients[data.to].name});
        }
        else {
            socket.emit('requestreply', {success: false});
        }
    });
    socket.on('remove', function() {
        // socket.leave already called
        delete clients[socket.id];
    });
    socket.on('disconnect', function() {
        var user = clients[socket.id];
        if (user) {
            var message = new Message();
            if (user.loc) {
                message.loc = loc;
            }
            message.socketid = socket.id;
            message.username = user.name
            message.body = user.name + " has left this chat.";
            message.type = 'text';
            console.log("leaving message");
            console.log(message.toJSON());
            var rooms = io.sockets.manager.roomClients[socket.id];
            for(room in rooms)
            {
                if (room && rooms[room])
                {
                    message._group = room.substring(1);
                    io.sockets.in(room.substring(1)).emit('message', message.toJSON());
                    console.log("Disconnecting");
                    console.log(socket.id);
                    socket.leave(clients[socket.id].group);
                }
            }
            socket.removeListener(clients[socket.id].group, function(data) {console.log(data)});
            delete clients[socket.id]; // memory leak?
        }
    });
    // Need to geolocate chat room members
});

var port = process.env.PORT || 3000;
server.listen(port);
console.log('Express started on port ' + port);
