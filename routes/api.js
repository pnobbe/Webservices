const express = require('express');
const router = express.Router();

module.exports = function (user) {

    router.use("/races", require('./api/races'));
    router.use("/users", require('./api/users'));
    router.use("/waypoints", require('./api/waypoints'));

    // Api docs
    router.use("/", express.static("./public/api-docs"));

    return router;
}
