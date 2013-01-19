var mongoose = require('mongoose')
, User = mongoose.model('User')
, middleware = require('../../config/middleware.js');
exports.show = function(req, res) {
}
exports.register = function(req, res) {
    var user = new User();
    if (!(req.body.email && req.body.password))
    {
        res.send(400);
    }
    else {
        user.email = req.body.email;
        user.password = req.body.password;
        if (req.body.paying == 'true')
        {
            user.paying = true;
        }
        user.save(function(err) {
            if (err) {
                console.log(err);
                res.send(500);
            }
            else {
                console.log(user);
                res.send("{'email': '"+user.email+"', 'token': '"+user.token+"'}");
            }
        });
    }
}

exports.login = function(req, res) {
    if (!(req.body.email && req.body.password))
    {
        res.send(400);
    }
    else {
        User.findOne({email: req.body.email}, function(err, doc) {
            if (err)
            {
                res.send(500);
            }
            else {
                doc.validatePassword(req.body.password, function(success) {
                    if (success) {
                        var token = doc.genToken();
                        doc.save(function(err) {
                            if (err) {
                                res.send(500);
                            }
                            else {
                                res.send("{'email': '"+doc.email+"', 'token': '"+token+"'}");
                            }
                        });
                    }
                    else {
                        res.send(400);
                    }
                });
            }
        });
    }
}
exports.logout = function(req, res) {
    User.findOne({email: req.body.email}, function(err, doc) {
        if (err) {
            res.send(500);
        }
        else if (doc.token === req.body.token) {
            // Delete cookies on page return
        }
        else {
            res.send(400);
        }
    });
}
exports.update = function(req, res) {
    middleware.auth(req, res, function(success, doc) {
        if (success) {
            if (req.body.newemail) {
                doc.email = req.body.newemail;
            }
            // Add in support for paying customers
            if (req.body.newpassword) {
                doc.password = req.body.newpassword;
            }
            res.send("{'email': '"+doc.email+"', 'token': '"+doc.genToken()+"'}");
        }
    });
}

exports.check = function(req, res) {
    if (req.body.email) {
        User.findOne({email: req.body.email}, function(err, doc) {
            if (doc && !err) {
                res.send("{'email': '"+doc.email+"', 'id': '"+doc.id+"'}");
            }
            else {
                res.send(400);
            }
        });
    }
    else {
        res.send(400);
    }
}
