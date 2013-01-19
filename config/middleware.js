var mongoose = require('mongoose')
, User = mongoose.model('User');

exports.auth = function(req, res, cb) {
    if (!(req.body.email && req.body.token))
    {
        res.send(400);
        cb(false);
    }
    else {
        User.findOne({email: req.body.email}, function(err, doc) {
            if (err) {
                res.send(500);
                cb(false);
            }
            console.log(doc.token);
            console.log(req.body.token);
            if (doc.token === req.body.token) {
                cb(true, doc);
            }
            else {
                res.send(400);
                cb(false);
            }
        });
    }
}

