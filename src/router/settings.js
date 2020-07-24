/* eslint-disable no-return-assign */
/* eslint-disable consistent-return */
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const { v4 } = require('uuid');
const { ValidationError } = require('sequelize');

const { httpChecker } = require('../utils/regexPatterns');
const { User } = require('../models/User');
const { Friend } = require('../models/Friend');
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

/**
 * @api {PUT} /settings/profile Update profile
 * @apiName update profile
 * @apiGroup SETTINGS
 * @apiDescription <p>
 * This api is used to update a user profile. However, this API will only update following fields
 * <ol>
 * <li>name</li>
 * <li>bio</li>
 * <li>location</li>
 * <li>website</li>
 * <li>dob</li>
 * <li>avatarPath</li>
 * <li>headerPhoto</li>
 * </ol>
 * </p>
 *
 * @apiParam (body) {Object} info this object must contain user text realted content
 * @apiParam (body) {String} info.name name of the user
 * @apiParam (body) {String} info.bio bio of the user. max length is 160 characters
 * @apiParam (body) {String} info.location location of the user
 * @apiParam (body) {String} info.website website of the user
 * @apiParam (body) {String} info.dob Birth Date of the user. Must be in yyyy-mm-dd
 * @apiParam (body) {multipart} avatar user avatar image
 * @apiParam (body) {multipart} user header photo
 * @apiParamExample {multipart} Request-Example:
 * {
 *  info: {
 *    name: 'user',
 *    bio: 'this is user bio',
 *    location: 'my location',
 *    dob: ''
 *  },
 *  avatar: // avatar image
 *  header: // header image
 * }
 *
 * @apiSuccess (Success) {null} 200 if profile update was successfull
 * @apiUse AuthUser
 * @apiUse validate
 * @apiUse serverError
 *
 */
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

    if (user.website !== '') {
      user.website = httpChecker.test(user.website) ? user.website : `http://${user.website}`;
    }

    const { files } = req;
    if (files.avatar !== undefined) {
      if (fs.existsSync(`${publicPath}/${req.user.avatarPath}`)
                && req.user.avatarPath !== '/images/avatar/default.png') {
        fs.unlinkSync(`${publicPath}/${req.user.avatarPath}`);
      }

      const fileName = `${v4()}.png`;
      const filePath = `${avatarPath}/${fileName}`;
      await sharp(files.avatar[0].buffer).png().toFile(filePath);
      user.avatarPath = `${fileName}`;
    }

    if (files.header !== undefined) {
      if (fs.existsSync(`${publicPath}/${req.user.headerPhoto}`)) {
        fs.unlinkSync(`${publicPath}/${req.user.headerPhoto}`);
      }

      const fileName = `${v4()}.png`;
      const filePath = `${headerPath}/${fileName}`;
      await sharp(files.header[0].buffer).png().toFile(filePath);
      user.headerPhoto = `${fileName}`;
    }

    await User.update(user, {
      where: {
        username: req.user.username,
      },
    });
    res.send();
  } catch (e) {
    if (e instanceof ValidationError) {
      res.status(400).send({ error: e.message });
    }
    res.status(500).send();
  }
});

router.put('/settings/notify', auth, async (req, res) => {
  try {
    const isValid = await Friend.findOne({
      where: {
        username: req.user.username,
        followed_username: req.body.username,
      },
    });

    if (!isValid) {
      throw new Error('Inavlid request');
    }

    await Friend.update({
      username: isValid.username,
      followed_username: isValid.followed_username,
      notify: !isValid.notify,
    }, {
      where: {
        username: req.user.username,
        followed_username: req.body.username,
      },
    });

    res.sendStatus(200);
  } catch (e) {
    console.log(e);
    res.sendStatus(400);
  }
});

module.exports = router;
