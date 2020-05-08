/* eslint-disable no-return-assign */
/* eslint-disable consistent-return */
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const { v4 } = require('uuid');
const User = require('../models/user');
const { auth } = require('../middlewares/auth');
const { avatarPath, headerPath, publicPath } = require('../utils/paths');

const router = express.Router();

const upload = multer({
  limits: {
    fileSize: 5 * 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(Error('Unsupported files uploaded to the server'));
    }

    cb(undefined, true);
  },
});

const mediaMiddleware = upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'header', maxCount: 1 },
]);

router.put('/settings/profile', mediaMiddleware, auth, async (req, res) => {
  const userUpdate = JSON.parse(req.body.info);
  const updates = Object.keys(userUpdate);
  const allowedUpdates = ['name', 'bio', 'location', 'website', 'dob'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Bad request parameters' });
  }

  try {
    const { user } = req;
    updates.forEach((update) => user[update] = userUpdate[update]);

    const { files } = req;
    if (files.avatar !== undefined) {
      if (fs.existsSync(`${publicPath}/${req.user.avatarPath}`)
                && req.user.avatarPath !== '/images/avatar/default.png') {
        fs.unlinkSync(`${publicPath}/${req.user.avatarPath}`);
      }

      const fileName = `${v4()}.png`;
      const filePath = `${avatarPath}/${fileName}`;
      await sharp(files.avatar[0].buffer).png().toFile(filePath);
      user.avatarPath = `/images/avatar/${fileName}`;
    }

    if (files.header !== undefined) {
      if (fs.existsSync(`${publicPath}/${req.user.headerPhoto}`)) {
        fs.unlinkSync(`${publicPath}/${req.user.headerPhoto}`);
      }

      const fileName = `${v4()}.png`;
      const filePath = `${headerPath}/${fileName}`;
      await sharp(files.header[0].buffer).png().toFile(filePath);
      user.headerPhoto = `/images/header/${fileName}`;
    }

    await User.update(user, {
      where: {
        username: req.user.username,
      },
    });

    user.avatarPath = process.env.TEMPURL + user.avatarPath;
    user.headerPhoto = process.env.TEMPURL + user.headerPhoto;
    res.send();
  } catch (e) {
    console.log(e);
    res.status(400).send();
  }
});

module.exports = router;
