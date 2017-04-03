const mongoose = require('mongoose');
const Regex = require('../service/regex');


console.log('Creating waypoint schema');

const waypointSchema = new mongoose.Schema({
    id: {type: String, required: true},
    name: {type: String, required: true}
});

waypointSchema.set('toJSON', {virtuals: true});
waypointSchema.set('toObject', {virtuals: true});

waypointSchema.statics.findById = function (id, cb) {
    return this.find({id: {$regex: "^" + Regex.parse(id) + "$"}}).exec(function (errors, data) {

        if (errors) {
            cb(errors, data[0]);
        }
        else {
            const Places = require('../service/places');
            let p = new Places();
            return p.waypointsToCoordinates(data).then(newData => {
                cb(errors, newData[0]);
            });
        }

    });
};

waypointSchema.statics.deleteWaypoint = function (id, done) {
    if (!id) {
        return done("Missing input data.", false);
    }
    this.findOneAndRemove({'id': {$regex: "^" + Regex.parse(id) + "$", $options: "i"}}, function (err) {
        return done(err);
    });
};

waypointSchema.statics.updateWaypoint = function (id, body, done) {
    if (!id) {
        return done("Missing input data.", false);
    }

    this.findOne({'id': {$regex: "^" + Regex.parse(id) + "$"}}, function (err, waypoint) {

            // if there are any errors, return the error
            if (err)
                return done(err, null);

            // return info without creating user
            if (!waypoint)
                return done("waypoint does not exist", null);

            if (body.id) {
                waypoint.id = body.id;
            }
            if (body.name) {
                waypoint.name = body.name;
            }

            waypoint.save(function (err, updatedWaypoint) {
                if (err)
                    return done("Error while saving", null);

                const Places = require('../service/places');
                let p = new Places();
                return p.waypointsToCoordinates([updatedWaypoint]).then(newData => {
                    done(null, newData[0]);
                });
            });
        }
    )
    ;
}
;

waypointSchema.statics.createNew = function (body, done) {

    if (!body.id || !body.name) {
        return done(null, false, "Missing input data.");
    }

//  Whether we're signing up or connecting an account, we'll need
    //  to know if the email address is in use.
    this.findOne({'id': {$regex: "^" + Regex.parse(body.id) + "$"}}, function (err, existingWaypoint) {

        // if there are any errors, return the error
        if (err)
            return done(err);

        // return info without creating user
        if (existingWaypoint)
            return done(null, false, "That ID is already taken.");

        // create the user
        let newWaypoint = new (mongoose.model('Waypoint', waypointSchema))();

        newWaypoint.name = body.name;
        newWaypoint.id = body.id;

        newWaypoint.save(function (err, waypoint) {
            if (err)
                throw err;

            const Places = require('../service/places');
            let p = new Places();
            return p.waypointsToCoordinates([waypoint]).then(newData => {
                done(null, newData[0]);
            });
        });
    });
};


const Waypoint = mongoose.model('Waypoint', waypointSchema);
