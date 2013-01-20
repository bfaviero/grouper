var mongoose = require('mongoose')
, Group = mongoose.model('Group')
, middleware = require('../../config/middleware')
, PAGE_SIZE=20;

exports.create = function(req, res) {
    console.log(req.body);
    var group = new Group();
    if (!(req.body.name && req.body.name.length && req.body.lat && !isNaN(req.body.lat) && req.body.lon && !isNaN(req.body.lon))) {
        console.log("invalid");
        console.log(req.body);
        res.send(400);
    }
    else {
        group.name = req.body.name;
        group.loc = [Number(req.body.lon), Number(req.body.lat)];
        var bad = false;
        if (req.body.email && req.body.email.length && req.body.token && req.body.token.length) {
            middleware.auth(req, res, function(success, doc) {
                if (success) {
                    group._user = doc._id;
                    if (req.body.pin) {
                        group.pin = req.body.pin;
                    }
                }
                else {
                    console.log("badgirl");
                    console.log(req.body);
                    bad = true;
                    res.send(400);
                }
            });
        }
        else if (req.body.pin && req.body.pin.length)
        {
            group.pin = req.body.pin;
        }
        else {
            bad = true;
            res.send(400);
        }

        if (!bad) {
            console.log("baddy");
            group.save(function(err) {
                if (err) {
                    console.log("hullo");
                    console.log(err);
                    res.send(500);
                }
                else {
                    console.log("hi there");
                    console.log(group.toJSON());
                    res.send(group.toJSON());
                }
            });
        }
    }
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
