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
            return p.createWaypoints(data).then(newData => {
                cb(errors, newData[0]);
            });
        }

    });
};

waypointSchema.statics.findAll = function (queries, offset, limit, callback) {

    return this.find(queries).skip(offset).limit(limit).exec(function (errors, data) {

        if (errors) {
            cb(errors, data);
        }
        else {
            const Places = require('../service/places');
            let p = new Places();
            return p.createWaypoints(data).then(newData => {
                callback(errors, newData);
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
                    done(err, null);

                const Places = require('../service/places');
                let p = new Places();
                return p.createWaypoints([updatedWaypoint]).then(newData => {
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
                done(err, null);

            const Places = require('../service/places');
            let p = new Places();
            return p.createWaypoints([waypoint]).then(newData => {
                done(null, newData[0]);
            });
        });
    });
};

waypointSchema.statics.printJSON = function (data) {

    if (data instanceof Waypoint) {
        var waypoint = {
            _id: data._id,
            id: data.id,
            name: data.name

        };
        return waypoint
    }
    else {
        var waypoint = {
            _id: data.waypoint._id,
            id: data.waypoint.id,
            name: data.waypoint.name

        };

        if (data.lat) {
            waypoint.address = data.address;
            waypoint.lat = data.lat;
            waypoint.lng = data.lng;
        }

        return waypoint
    }

};

waypointSchema.statics.printHTML = function (data) {

    if (data instanceof Waypoint) {
        var resp = "<div>";
        resp += "<h3>" + data._id + "</h3>";
        resp += "<h3>" + data.name + "</h3>";
        resp += "<h2>" + data.id + "</h2>";
        resp += "</div>";
        return resp;
    }
    else {
        var resp = "<div>";
        resp += "<h3>" + data.waypoint._id + "</h3>";
        resp += "<h3>" + data.waypoint.name + "</h3>";
        resp += "<h2>" + data.waypoint.id + "</h2>";

        if (data.lat) {
            resp += "<h3>" + data.address + "</h3>";
            resp += "<h4 class='LAT'>" + data.lat + "</h4>";
            resp += "<h4 class='LNG'>" + data.lng + "</h4>";
        }
        resp += "</div>";

        return resp;
    }
};

const Waypoint = mongoose.model('Waypoint', waypointSchema);
