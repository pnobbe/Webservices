const mongoose = require('mongoose');

console.log('Creating waypoint schema');

const waypointSchema = new mongoose.Schema({
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


const Waypoint = mongoose.model('Waypoint', waypointSchema);
