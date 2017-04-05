const express = require('express');
const router = express.Router();
const configDB = require('../config/db');
module.exports = function (user) {

    router.use("/races", require('./api/races'));
    if (configDB.testing) {
        router.use("/users", require('./api/users'));
    }
    else {
        router.use("/users", user.is('admin'), require('./api/users'));
    }
    router.use("/waypoints", require('./api/waypoints'));

    // Api docs
    router.use("/", express.static("./public/api-docs"));

    return router;
}
