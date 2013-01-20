var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var GroupSchema = new Schema({
    _user: {type: Schema.ObjectId, ref: 'User'},
    name: {type: String, required: true, index: {unique: true} },
    pin: {type: String},
    loc: {type: [Number], index: '2d', required: true},
    date: {type: Date, default: Date.now, required: true},
    lastused: {type: Date, default: Date.now, required: true}
});

module.exports = mongoose.model('Group', GroupSchema);
