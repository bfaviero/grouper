var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var MessageSchema = new Schema({
    //_group: {type: Schema.ObjectId, required: true, ref: 'Group'},
    _group: {type: String},
    _user: {type: Schema.ObjectId, ref: 'User'},
    username: {type: String, required: true},
    body: {type: String, required: true},
    type: {type: String, enum: ['text','image'], required: true},
    loc: {type: [Number], index: '2d'},
    date: {type: Date, default: Date.now, required: true},
    socketid: {type: String}
});

module.exports = mongoose.model('Message', MessageSchema);
