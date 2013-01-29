var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var GroupSchema = new Schema({
    _user: {type: Schema.ObjectId, ref: 'User'},
    name: {type: String, required: true, index: {unique: true} },
    pin: {type: String},
    loc: {type: [Number], index: '2d', required: true},
    date: {type: Date, default: Date.now, required: true},
    radius: {type: Number, default: 0.25, required: true},
    count: {type: Number, default: 0, required: true},
    lastused: {type: Date, default: Date.now, required: true}
});

GroupSchema.virtual('json').get(function() {
    var pinned = this.pin ? true : false;
    return '{"name": "'+this.name+'", "_user": "'+this._user+'", "_id": "'+this._id+'", "pinned": '+pinned+', "loc": ['+this.loc+'], "date": "'+(new Date(this.date))+'", "lastused": "'+this.lastused+'", "count": '+this.count+'}';
});

GroupSchema.methods.distjson = function(dist) {
    var pinned = this.pin ? true : false;
    return '{"name": "'+this.name+'", "_user": "'+this._user+'", "_id": "'+this._id+'", "pinned": '+pinned+', "loc": ['+this.loc+'], "date": "'+(new Date(this.date))+'", "lastused": "'+this.lastused+'", "dist": '+dist+', "count": '+this.count+'}';
};

module.exports = mongoose.model('Group', GroupSchema);
