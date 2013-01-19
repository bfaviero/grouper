var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var GroupSchema = new Schema({
    name: {type: String, required: true},
    pin: {type: String},
    loc: {type: [Number], index: '2d', required: true},
    date: {type: Date, default: Date.now, required: true},
    lastused: {type: Date, default: Date.now, required: true}
});

UserSchema.virtual('json').get(function() {
    return "{'name': '"+this.name+"', 'lat': "+this.loc[1]+", 'lon': "+this.loc[0]+", 'private': "+Boolean(this.pin !=== undefined)+", 'lastused': "+this.lastused.getTime()+"}";
});

module.exports = mongoose.model('Group', GroupSchema);
