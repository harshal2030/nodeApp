const express = require('express');
const basic = require('express-basic-auth');
const { Tracker } = require('../models/Tracker');

const middleware = basic({
  users: {
    tokenHandler: 'FCM gcm 957895 AWure',
  },
});

const router = express.Router();

router.put('/token/notification', async (req, res) => {
  try {
    const token = await Tracker.findOne({
      where: {
        uniqueId: req.body.uniqueId,
      },
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

router.delete('/token/notification', middleware, async (req, res) => {
  try {
    await Tracker.destroy({
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
