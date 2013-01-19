var mongoose = require('mongoose')
, Group = mongoose.model('Group')
, middleware = require('../../config/middleware.js')
, PAGE_SIZE=20;

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
                group._user = doc._id;
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
                    res.send(group.json);
                });
            }
        }
    });
}

exports.search = function(req, res) {
    var callback = function(err, docs) {
        if (!err) {
            console.log(docs);
            var out = "[";
            for(var i=0;i<docs.length;i++) {
                out += docs[i].json;
                if (i < docs.length-1) {
                    out += ", ";
                }
            }
            out += "]";
            res.send(out);
        }
        else {
            console.log(err);
            res.send(400);
        }
    };
    if (req.body.user) {
        Group.find({_user: req.body.id}, callback);
    }
    else {
        var hasloc=(req.body.lat && req.body.lon);
        var start = 0;
        if (req.body.page) {
            start = Math.floor(PAGE_SIZE * Number(req.body.page));
        }
        if (req.body.name && req.body.name.length) {
            var term = req.body.name.toLowerCase()
            if (hasloc) {
                Group.find({name: new RegExp(term), loc: { $near: [Number(req.body.lon), Number(req.body.lat)]}}).skip(start).limit(PAGE_SIZE).exec(callback);
            }
            else {
                //Group.find({name: /term/}).skip(start).limit(PAGE_SIZE).sort("-lastused").all(callback);
                Group.find({name: new RegExp(term)}).skip(start).limit(PAGE_SIZE).sort("-lastused").exec(callback);
            }
        }
        else {
            if (!(req.body.lat && req.body.lon)) {
                res.send(400);
            }
            else {
                //Group.find({geoNear: "loc", near: [Number(req.body.lon), Number(req.body.lat)]}).skip(start).limit(PAGE_SIZE).exec(callback);
                Group.find({"loc": {$near: [Number(req.body.lon), Number(req.body.lat)]}}).skip(start).limit(PAGE_SIZE).exec(callback);
            }
        }
    }
}
