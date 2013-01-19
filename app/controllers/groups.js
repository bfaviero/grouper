var mongoose = require('mongoose')
, Group = mongoose.model('Group')
, middleware = require('../../config/middleware.js');

exports.create = function(req, res) {
    middleware.auth(req, res, function(success, doc) {
        if (success) {
            var group = new Group();
            if (!((req.body.name && req.body.name.length) && req.body.lat && req.body.lon)) {
                res.send(400);
                return;
            }
            else {
                group.name = req.body.name;
                group.loc = [Number(req.body.lon), Number(req.body.lat)];
                if (req.body.pin) {
                    if (!doc.paying) {
                        res.send(400);
                        return;
                    }
                    else {
                        group.pin = req.body.pin;
                    }
                }
                group.save(function(err) {
                    if (err) {
                        console.log(err);
                        res.send(500);
                    }
                    else {
                        console.log(group);
                    }
                    res.send(group.toJSON());
                });
            }
        }
    });
}
