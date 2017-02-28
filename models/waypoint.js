var mongoose = require('mongoose');

console.log('Iniializing waypoint schema');

var waypointSchema = new mongoose.Schema({
    id: {type: String, required: true, index: true},
    name: {type: String, required: true},
    // can be collected from the API :D
    //coordinates: {
    //    lat: {type: Number, required: true},
    //    lon: {type: Number, required: true}
    //}
});

waypointSchema.set('toJSON', {virtuals: true});
waypointSchema.set('toObject', {virtuals: true});


var waypoint = mongoose.model('Waypoint', waypointSchema);