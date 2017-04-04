var mongoose = require('mongoose');
var User = mongoose.model('User');
var Waypoint = mongoose.model('Waypoint');
const Regex = require('../service/regex');
console.log('Creating races schema');

var raceSchema = new mongoose.Schema({
    name: {type: String, required: true, index: true, unique: true},
    city: {type: String, required: true},
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
    creationDate: {
        type: Date, required: true
    },
    startTime: {
        type: Date
    },
    stopTime: {
        type: Date
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


raceSchema.statics.findByName = function (name, cb) {
    return this.findOne({name: {$regex: "^" + Regex.parse(name) + "$"}}).exec(cb);
};


raceSchema.statics.deleteRace = function (name, done) {
    if (!name) {
        return done("Missing input data.", false);
    }
    this.findOneAndRemove({name: {$regex: "^" + Regex.parse(name) + "$"}}, function (err) {
        return done(err);
    });
};

raceSchema.statics.updateRace = function (name, body, done) {
    if (!name) {
        return done("Missing input data.", false);
    }

    this.findOne({name: {$regex: "^" + Regex.parse(name) + "$"}}, function (err, race) {

            // if there are any errors, return the error
            if (err)
                return done(err, null);

            // return info without creating user
            if (!race)
                return done("race does not exist", null);

            // todo
            console.log("TODO!!!!");

            race.save(function (err, newRace) {
                if (err)
                    return done("Error while saving", null);
                return done(null, newRace);
            });
        }
    )
    ;
}
;


raceSchema.statics.createNew = function (body, done) {


    if (!body.name || !body.owner || !body.city) {
        return done(null, false, "Missing input data.");
    }

//  Whether we're signing up or connecting an account, we'll need
    //  to know if the email address is in use.
    this.findOne({'name': {$regex: "^" + Regex.parse(body.name) + "$"}}, function (err, existingWaypoint) {

            // if there are any errors, return the error
            if (err)
                return done(err);

            // return info without creating user
            if (existingWaypoint)
                return done(null, false, "That name is already taken.");

            // create the user
            let newRace = new (mongoose.model('Waypoint', raceSchema))();

            newRace.name = body.name;
            newRace.city = body.city;
            newRace.owner = body.owner;
            newRace.participants = body.participants ? body.participants : [];
            newRace.waypoints = body.waypoints ? body.waypoints.map(function (entree) {
                return {waypoint: entree, passed_participants: []}
            }) : [];


            newRace.save(function (err, race) {
                if (err)
                    throw err;
                done(null, race);
            });
        }
    );
};


var Race = mongoose.model('Race', raceSchema);
