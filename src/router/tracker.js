const express = require('express');
const Tracker = require('../models/tracker');

const router = express.Router();

router.put('/token/notification', async (req, res) => {
  try {
    const token = await Tracker.findOne({
      where: {
        uniqueId: req.body.uniqueId,
      },
      raw: true,
    });

    if (!token) {
      Tracker.create(req.body);
    }

    Tracker.update({ notificationToken: req.body.notificationToken }, {
      where: {
        uniqueId: req.body.uniqueId,
      },
    });

    res.send();
  } catch (e) {
    res.sendStatus(400);
  }
});

module.exports = router;
