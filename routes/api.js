const express = require('express');
const router = express.Router();

const waypointRouter = require('./waypoints');
const raceRouter = require('./races');
const userRouter = require('./users');

router.use("/races", raceRouter);
router.use("/users", userRouter);
router.use("/waypoints", waypointRouter);

/* Api docs */
router.use('/', express.static('./public/api-docs'));

module.exports = router;
