var mongoose = require('mongoose')
, Group = mongoose.model('Group')
, Message = mongoose.model('Message')
, PAGE_SIZE=20;
exports.get = function(req, res) {
    if (req.body.group && req.body.group.length)
    {
        var start = 0;
        if (req.body.page) {
            start = Math.floor(PAGE_SIZE * Number(req.body.page));
        }
        Group.findOne({_id: req.body.group}).skip(start).limit(PAGE_SIZE).exec(function(err, doc) {
            if (!doc.pin || (req.body.pin && req.body.pin === doc.pin)) {
                Message.find({_group: req.body.group}, function(err, docs) {
                    if (err) {
                        res.send(500);
                    }
                    else {
                        var out = "[";
                        for(var i=0;i<docs.length;i++) {
                            out += JSON.stringify(docs[i]);
                            if (i < docs.length-1) {
                                out += ", ";
                            }
                        }
                        out += "]";
                        res.send(out);
                    }
                });
            }
            else {
                res.send(400);
            }
        });
    }
}

exports.post = function(req, res) {
    if (!(req.body.group && req.body.group.length && req.body.username &&
          req.body.username.length && req.body.body && req.body.body.length &&
          req.body.type && req.body.type.length &&
          Message.schema.path('type').enumValues.indexOf(req.body.type) >= 0)) {
        res.send(400);
    }
    else {
        Group.findOne({_id: req.body.group}, function(err, doc) {
            if (err) {
                res.send(500);
            }
            else if (!doc) {
                res.send(400);
            }
            else {
                var bad = false;
                var message = new Message();
                message._group = doc._id;
                message.body = req.body.body;
                message.username = req.body.username;
                message.type = req.body.type;
                if (req.body.lat && !isNaN(req.body.lat) && req.body.lon && !isNaN(req.body.lon)) {
                    message.loc = [Number(req.body.lon), Number(req.body.lat)];
                }
                if (req.body.user && req.body.user.length && req.body.token && req.body.token.length) {
                    middleware.auth(req, res, function(success, doc) {
                        if (success) {
                            message._user = doc._id;
                        }
                        else {
                            bad = true;
                            res.send(400);
                        }
                    });
                }
                if (!bad)
                {
                    message.save(function(err) {
                        if (err) {
                            console.log(err);
                            res.send(500);
                        }
                        else {
                            console.log(message);
                            res.send("{'status':'received'}");
                        }
                    });
                }
            }
        });
    }
}
