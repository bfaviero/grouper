module.exports = function(app, io) {
    // API - JSON based
    // NOTE: destinations are read-only through this interface
    var misc = require('../app/controllers/misc');
    var users = require('../app/controllers/users');
    var messages = require('../app/controllers/messages');
    var groups = require('../app/controllers/groups');
    groups.setsocketio(io);
    app.get('/', misc.home);
    app.get('/demo', misc.demo);

    // Users
    app.post('/register', users.register); // Register new users
    app.post('/login', users.login); // Auth a user password or token
    app.post('/check', users.check); // Check if a user exists
    app.post('/logout', users.logout); // Logout a user
    app.post('/update', users.update); // Edit user info

    // Messages are socket.io for now, could be post later?
    app.post('/messages', messages.get); // Get all the messages in a group
    app.post('/post', messages.post); // Post a message

    // Groups
    app.post('/create', groups.create); // Create a new group - requires user auth
    app.post('/search', groups.search); // Search for nearby groups if lat/lon provided, otherwise most popular

}
