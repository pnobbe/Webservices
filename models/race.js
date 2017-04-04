var mongoose = require('mongoose');
var User = mongoose.model('User');
var Waypoint = mongoose.model('Waypoint');
const Regex = require('../service/regex');
console.log('Creating races schema');

var raceSchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true},
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
    return this.findOne({name: {$regex: "^" + Regex.parse(name) + "$"}}).populate("owner waypoints.waypoint waypoints.passed_participants.user participants").exec(cb);
};


raceSchema.statics.deleteRace = function (name, done) {
    if (!name) {
        return done("Missing input data.", false);
    }
    this.findOneAndRemove({name: {$regex: "^" + Regex.parse(name) + "$"}}, function (err) {
        return done(err);
    });
};

/*
 You can add plain old waypoint objects OR waypoint + passed_participant objects
 */
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

            race.name = body.name ? body.name : race.name;
            race.city = body.city ? body.city : race.city;
            race.owner = body.owner ? body.owner : race.owner;
            race.participants = body.participants ? body.participants.map(function (entree) {
                if (entree instanceof mongoose.Types.ObjectId) {
                    return entree;
                }
                return mongoose.Types.ObjectId(entree);

            }) : race.participants;
            race.waypoints = body.waypoints ? body.waypoints.map(function (entree) {
                if (entree.passed_participants != null) {
                    return entree;
                }
                if (entree instanceof mongoose.Types.ObjectId) {
                    return {waypoint: entree, passed_participants: []}
                }
                return {waypoint: mongoose.Types.ObjectId(entree), passed_participants: []}

            }) : race.waypoints;

            race.startTime = body.startTime ? body.startTime : race.startTime;
            race.stopTime = body.stopTime ? body.stopTime : race.stopTime;
            if (race.startTime) {
                if (race.creationDate > race.startTime) {
                    done("startTime should not come before creationdate", null);
                    return;
                }
            }

            // Date validation
            if (race.stopTime) {
                if (!race.startTime) {
                    done("stopTime should not come without startTime", null);
                }
                if (race.creationDate > race.stopTime) {
                    done("stopTime should not come before creationdate", null);
                    return;
                }
                if (race.startTime >= race.stopTime) {
                    done("stopTime should come after startTime", null);
                    return;
                }
            }

            race.save(function (err, race) {
                if (err)
                    done(err, null);
                else {
                    done(null, race);
                }

            });
        }
    )
    ;
}
;

raceSchema.statics.printJSON = function (race) {
    var obj = {
        name: race.name,
        city: race.city,
        creationdate: race.creationDate,
        startTime: race.startTime,
        stopTime: race.stopTime

    };
    obj.owner = race.owner;
    if (race.owner != null && race.owner instanceof User) {
        obj.owner = User.printJSON(race.owner);
    }

    obj.participants = race.participants;
    if (race.participants != null && race.participants.length > 0 && race.participants[0] instanceof User) {
        obj.participants = race.participants.map(User.printJSON);
    }
    obj.waypoints = race.waypoints;

    if (race.waypoints != null && race.waypoints.length > 0 && race.waypoints[0].waypoint && race.waypoints[0].waypoint instanceof Waypoint) {
        obj.waypoints = race.waypoints.map(data => {

            var waypoint = Waypoint.printJSON(data.waypoint);

            return {
                waypoint: waypoint,
                participants: data.passed_participants.map(data => {

                    if (data.user instanceof User) {
                        return {
                            user: User.printJSON(data.user),
                            time: data.time
                        }
                    }
                    else {
                        return data;
                    }
                })

            }
        });
    }

    return obj;
};

raceSchema.statics.printHTML = function (data) {

    var resp = "<div>";
    resp += "<p>" + (data.name ? data.name : "-") + "</p>";
    resp += "<p>" + (data.city ? data.city : "-") + "</p>";
    resp += "<p>" + (data.creationdate ? data.creationdate.toString() : "-") + "</p>";
    resp += "<p>" + (data.startTime ? data.startTime.toString() : "-") + "</p>";
    resp += "<p>" + (data.stopTime ? data.stopTime.toString() : "-") + "</p>";

    // owner
    resp += "<div>" + (data.owner instanceof User ? User.printHTML(data.owner) : data.owner) + "</div>";

    // participants
    if (data.participants != null && data.participants.length > 0 && data.participants[0] instanceof User) {
        resp += "<div>";
        data.participants.forEach(el => {
            resp = User.printJSON(el)
        });
        resp += "</div>";
    }

    // waypoints
    if (data.waypoints != null && data.waypoints.length > 0 && data.waypoints[0].waypoint && data.waypoints[0].waypoint instanceof Waypoint) {
        data.waypoints.forEach(data => {
            resp += "<div>";
            resp += Waypoint.printHTML(data.waypoint);


            data.passed_participants.forEach(data => {

                if (data.user instanceof User) {
                    resp += "<div>";
                    User.printHTML(data.user);
                    resp += "<p>" + data.time.toString() + "</p>";
                    resp += "</div>";
                }
            });
            resp += "</div>";
        });
    }

    resp += "</div>";
    return resp;
};


raceSchema.statics.createNew = function (body, done) {

    if (!body.name || !body.owner || !body.city) {
        return done(null, false, "Missing input data.");
    }

    this.findOne({'name': {$regex: "^" + Regex.parse(body.name) + "$"}}, function (err, existingWaypoint) {

            // if there are any errors, return the error
            if (err)
                return done(err);

            // return info without creating user
            if (existingWaypoint)
                return done(null, false, "That name is already taken.");

            // create the user
            let newRace = new (mongoose.model('Race', raceSchema))();

            newRace.name = body.name;
            newRace.creationDate = Date.now();
            newRace.city = body.city;
            newRace.owner = body.owner;
            newRace.participants = body.participants ? body.participants : [];
            newRace.waypoints = body.waypoints ? body.waypoints.map(function (entree) {
                return {waypoint: entree, passed_participants: []}
            }) : [];


            newRace.save(function (err, race) {
                if (err)
                    done(err, null);
                else
                    done(null, race);
            });
        }
    );
};


var Race = mongoose.model('Race', raceSchema);
