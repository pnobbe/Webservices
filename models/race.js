var mongoose = require('mongoose');
var User = mongoose.model('User');
var Waypoint = mongoose.model('Waypoint');
console.log('Creating races schema');

var raceSchema = new mongoose.Schema({
    name: {type: String, required: true, index: true, unique: true},
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true

    },
    participants: [{

        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'

    }],
    waypoints: [
        {
            waypoint: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Waypoint'

            },
            passed_participants: [{
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true

                },
                time: {type: Date, required: true}
            }]
        }
    ],
    startTime: {
        type: Date, min: new Date()
    }
    ,
    stopTime: {
        type: Date, min: new Date()
    }
});

raceSchema.set('toJSON', {virtuals: true});
raceSchema.set('toObject', {virtuals: true});

raceSchema.virtual('isActive').get(function () {
    if (this.startTime === null) {
        return false;
    }
    if (this.startTime < new Date()) {
        if (this.stopTime === null || new Date() < this.stopTime) {
            return true;
        }
    }
    return false;
});

var Race = mongoose.model('Race', raceSchema);
