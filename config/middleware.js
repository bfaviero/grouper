var mongoose = require('mongoose')
, User = mongoose.model('User');

exports.auth = function(req, res, cb) {
    if (!(req.body.email && req.body.token))
    {
        cb(false);
    }
    else {
        User.findOne({email: req.body.email}, function(err, doc) {
            if (err || !doc) {
                cb(false);
            } else {
                console.log(doc.token);
                console.log(req.body.token);
                if (doc.token === req.body.token) {
                    cb(true, doc);
                }
                else {
                    cb(false);
                }
            }
        });
    }
}

