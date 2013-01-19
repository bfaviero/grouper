var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var GroupSchema = new Schema({
    name: {type: String, required: true},
    pin: {type: String},
    loc: {type: [Number], index: '2d', required: true},
    date: {type: Date, default: Date.now, required: true},
    lastused: {type: Date, default: Date.now, required: true}
});

module.exports = mongoose.model('Group', GroupSchema);
