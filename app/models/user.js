var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt'),
    SALTINESS = 10;

var UserSchema = new Schema({
    email: {type: String, required: true, index: {unique: true}},
    passhash: {type: String, required: true},
    token: {type: String, default: '', required: true},
    paying: {type: Boolean, default: false, required: true},
    date: {type: Date, default: Date.now, required: true}
});

UserSchema.virtual('password').set(function(password, done) {
    this.passhash = bcrypt.hashSync(password, bcrypt.genSaltSync(SALTINESS));
    this.genToken();
})
    .get(function() {return this.token;});

UserSchema.methods.genToken = function() {
    this.token = bcrypt.hashSync(this.passhash+this.token, bcrypt.genSaltSync(SALTINESS));
    return this.token;
}

UserSchema.methods.validatePassword = function(pass, cb) {
    if (this.passhash) {
        bcrypt.compare(pass, this.passhash, function(error, res) {
            return cb(res)
        });
    } else {
        return cb(false);
    }
};

module.exports = mongoose.model('User', UserSchema);
