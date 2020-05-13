const express = require('express');
const Tag = require('../models/tag');

const router = express.Router();

router.get('/hashtags/:tag', async (req, res) => {
  try {
    const tags = await Tag.findAll({
      where: {
        tag: req.params.tag,
      },
      limit: 6,
    });

    if (!tags) {
      throw new Error('No such tag');
    }

    res.send(tags);
  } catch (e) {
    res.sendStatus(404);
  }
});

module.exports = router;
