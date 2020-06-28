/* eslint-disable camelcase */
const express = require('express');

const router = express.Router();
const { Op } = require('sequelize');

const { ValidationError } = require('sequelize');
const Block = require('../models/block');
const User = require('../models/user');
const Friend = require('../models/friend');
const { auth } = require('../middlewares/auth');
const Tracker = require('../models/tracker');
const firebaseAdmin = require('../../admin/firebase');

/**
 * @apiDefine account
 * @apiParam (body) {Object} [device] contain device info of user
 * @apiParam (body) {String} [device.os] OS used by the user
 * @apiParam (body) {String} [device.osVersion] Version of OS used by the user
 * @apiParam (body) {String} [device.deviceBrand] Brand brand used by the user
 * @apiParam (body) {String} [device.buildNumber] build number of device used by the user
 * @apiParam (body) {String} [device.fontScale] font scale of the device used by the user
 * @apiParam (body) {String} [device.uniqueId] uniqueId of the device used by the user
 * @apiParam (body) {String} [device.notificationToken] notification token of device used by user
 * @apiSuccess {Object} user user profile info
 * @apiSuccess {String} user.name name of the user
 * @apiSuccess {String} user.username username of the user
 * @apiSuccess {String} user.dob DOB of the user
 * @apiSuccess {String} user.createdAt date on which user registered
 * @apiSuccess {String} user.avatarPath avatar file name of the user
 * @apiSuccess {String} user.bio bio of the user
 * @apiSuccess {String} user.location location of the user
 * @apiSuccess {String} user.headerPhoto header photo file name of the user
 * @apiSuccess {String} user.website website of the user
 * @apiSuccess {Number} user.followers followers of the user
 * @apiSuccess {Number} user.following following of the user
 * @apiSuccess {String} token A token to be stored and must include in every request
 * @apiSuccessExample success-response:
 * {
 *   "user": {
 *       "name": "name",
 *       "username": "",
 *       "adm_num": null,
 *       "dob": "2003-01-19",
 *       "createdAt": "2020-06-14T09:32:57.413Z",
 *       "avatarPath": "default.png",
 *       "bio": "I'm in it to",
 *       "location": "",
 *       "headerPhoto": null,
 *       "website": "",
 *       "followers": 2,
 *       "following": 0
 *   },
 *   "token": "fgdfg43-dfdfgdfg.dfgerewf.sdgsdggdfg"
 *}
 */

/**
 * @api {POST} /users Create Account
 * @apiName sign up
 * @apiGroup USER
 * @apiDescription Register a user for using services provided by us
 * @apiParam (body) {Object} user must contain the user info.
 * @apiParam (body) {String} user.name Name of the user
 * @apiParam (body) {String} user.username username of the user
 * @apiParam (body) {String} user.email Mail of the user
 * @apiParam (body) {String} user.dob Birth Date of the user. Must be in yyyy-mm-dd format
 * @apiParam (body) {String} user.password Pasword for the account.
 * Must have atleast 6 characters
 * @apiParamExample {json} Request Example:
 * {
 *  user: {
 *    name: "name",
 *    username: "username",
 *    email: "somebody@example.com",
 *    dob: "2003-01-19",
 *    password: "shh..supersecret"
 *  },
 *  device: { // totally optional
 *    os: "",
 *    osVersion: "",
 *    deviceBrand: "",
 *    buildNumber: "",
 *    fontScale: "",
 *    uniqueId: "",
 *    notificationToken: "",
 *  }
 * }
 * @apiUse serverError
 * @apiUse validate
 * @apiUse account
 */
router.post('/users', async (req, res) => {
  /**
     * Route for sigining up a user
     * 201 for success
     * 400 for failure
     * need to add more status
     */
  try {
    const user = await User.create(req.body.user);
    const [token, userData] = await Promise.all([
      user.generateAuthToken(),
      user.removeSensetiveUserData(),
    ]);

    if (req.body.device) {
      const trackValues = { username: req.body.user.username, token, ...req.body.device };
      // check if device is in data base
      const isDevicePresent = await Tracker.findOne({
        where: {
          uniqueId: req.body.device.uniqueId,
        },
      });

      if (!isDevicePresent) {
        // create if device is not present
        Tracker.create(trackValues);
      } else {
        // update values if device present
        Tracker.update(trackValues, {
          where: {
            uniqueId: req.body.device.uniqueId,
          },
        });
      }
    }

    return res.status(201).send({ user: userData, token });
  } catch (e) {
    if (e instanceof ValidationError) {
      return res.status(400).send({ error: e.message });
    }
    return res.status(400).send({ error: 'Something went wrong. please try again later' });
  }
});

/**
 * @api {POST} /users/login Log In
 * @apiName log in
 * @apiGroup USER
 * @apiParam (body) {Object} user must contain the user info.
 * @apiParam (body) {String} user.username Username of the user
 * @apiParam (body) {String} user.password password of the user
 * @apiParamExample {json} Request-example
 * {
 *  user: {
 *    username: "username",
 *    password: "shh..supersecret"
 *  },
 *  device: { // totally optional
 *    os: "",
 *    osVersion: "",
 *    deviceBrand: "",
 *    buildNumber: "",
 *    fontScale: "",
 *    uniqueId: "",
 *    notificationToken: "",
 *  }
 * }
 * @apiUse account
 * @apiUse serverError
 * @apiError (Error) 404 cannot find user with above credentials
 */
router.post('/users/login', async (req, res) => {
  /**
     * Route to login the user
     * 200 for success
     * 404 for not found
     */
  try {
    const user = await User.findByCredentials(req.body.user.email, req.body.user.password);
    const [token, userData] = await Promise.all([
      user.generateAuthToken(),
      user.removeSensetiveUserData(),
    ]);

    if (req.body.device) {
      const trackValues = { username: userData.username, token, ...req.body.device };
      // check if device is in data base
      const isDevicePresent = await Tracker.findOne({
        where: {
          uniqueId: req.body.device.uniqueId,
        },
      });

      if (!isDevicePresent) {
        // create if device is not present
        Tracker.create(trackValues);
      } else {
        // update values if device present
        Tracker.update(trackValues, {
          where: {
            uniqueId: req.body.device.uniqueId,
          },
        });
      }
    }

    res.send({ user: userData, token });
  } catch (e) {
    console.log(e);
    res.status(404).send(e);
  }
});

/**
 * @api {GET} /users/:username Get user profile
 * @apiDescription Get user profile
 * @apiName user profile
 * @apiIgnore
 * @apiGroup USER
 * @apiParam (url param) {String} :username username of the user whose profile is to be fetched
 * @apiSuccess (200) {Object} user object with user props
 * @apiSuccessExample {type} Success-Response:
 * {
 *   name: "",
 *   username: "",
 *   adm_num: null,
 *   dob: "2003-01-19",
 *   createdAt: "",
 *   avatarPath: "default.png",
 *   bio: "I'm in it to",
 *   location: "",
 *   headerPhoto: null,
 *   website: "",
 *   followers: 2,
 *   following: 0
 * }
 */
// GET /users/username
router.get('/users/:username', async (req, res) => {
  /**
     * Route for fetching user profile
     * 200 for success
     * 404 for not found
     * need to support for private account
     */
  try {
    const user = await User.findOne({ where: { username: req.params.username } });
    if (!user) {
      throw new Error('No user found');
    }
    const userData = await user.removeSensetiveUserData();

    res.send(userData);
  } catch (e) {
    console.log(e);
    res.status(404).send();
  }
});


// GET /users/username/full
router.get('/users/:username/full', auth, async (req, res) => {
  /**
     * Route to get user profile with addintional info like isFollowing.
     * 200 for success
     * 404 for no user
     */
  try {
    const user = await User.findOne({ where: { username: req.params.username } });
    if (!user) {
      throw new Error('No user found');
    }

    const blocked = await Block.findOne({
      where: {
        blocked: req.user.username,
        blockedBy: req.params.username,
      },
    });

    if (blocked) {
      return res.status(403).send({ msg: 'You are blocked by requested user' });
    }

    const userData = await user.removeSensetiveUserData();

    const requester = req.user.username;
    const isFollowing = await Friend.findOne({
      where: {
        username: requester,
        followed_username: req.params.username,
      },
    });

    const follows_you = await Friend.findOne({
      where: {
        username: req.params.username,
        followed_username: requester,
      },
    });

    if (!follows_you) {
      userData.follows_you = false;
    } else {
      userData.follows_you = true;
    }

    if (!isFollowing) {
      userData.isFollowing = false;
      userData.notify = false;
    } else {
      userData.isFollowing = true;
      userData.notify = isFollowing.notify;
    }

    return res.send(userData);
  } catch (e) {
    return res.status(404).send(e);
  }
});

/**
 * @api {POST} /users/follow Follow a user
 * @apiName follow user
 * @apiDescription Route for following a user.
 * Your body must follow tese standards:-
 * 1 Must not be identical pair
 * 2 Must be valid username
 * @apiGroup USER
 * @apiParam (body) {String} username username of the user whom to follow
 * @apiParamExample {json} request-example:
 * {
 *  "username": "username.of.user"
 * }
 * @apiSuccess (Success) {null} 201
 * @apiUse AuthUser
 * @apiError (Error) {null} 400 if your request does not adhere above standards
 */
router.post('/users/follow', auth, async (req, res) => {
  try {
    const userExists = await User.findOne({ where: { username: req.body.username } });
    if (!userExists) {
      throw new Error('No such user exists');
    }

    if (req.user.username === req.body.username) {
      throw new Error('Got identical value pair.');
    }

    await Friend.findOrCreate({
      where: {
        username: req.user.username,
        followed_username: req.body.username,
      },
    });

    const tokens = await Tracker.findAll({
      where: {
        username: req.body.username,
      },
    }).map((token) => token.notificationToken);

    if (tokens.length !== 0) {
      firebaseAdmin.messaging().sendMulticast({
        tokens,
        android: {
          priority: 'high',
        },
        notification: {
          title: req.user.name,
          body: `@${req.user.username} is now following you`,
        },
        data: {
          type: 'openProfile',
          username: req.user.username,
        },
      });
    }

    res.status(201).send();
  } catch (e) {
    res.status(400).send();
  }
});

router.delete('/users/follow', auth, async (req, res) => {
  try {
    if (req.user.username === req.body.username) {
      throw new Error('Got identical value pair.');
    }

    const unfollowed = await Friend.destroy({
      where: {
        username: req.user.username,
        followed_username: req.body.username,
      },
    });

    if (!unfollowed) {
      throw new Error('No such entry exists');
    }

    res.send();
  } catch (e) {
    console.log(e);
    res.status(400).send();
  }
});


// GET /users/username/followers?skip=0&limit=30
router.get('/users/:username/followers', auth, async (req, res) => {
  /**
     * Route for getting user followers
     */
  const skip = req.query.skip === undefined ? undefined : parseInt(req.query.skip, 10);
  const limit = req.query.limit === undefined ? undefined : parseInt(req.query.limit, 10);
  try {
    const followers = await Friend.getUserFollowers(req.params.username, skip, limit);

    const isFollowing = await Friend.findAll({
      where: {
        username: req.user.username,
        followed_username: {
          [Op.in]: followers.map((user) => user.username),
        },
      },
      raw: true,
      attributes: ['followed_username'],
    }).map((follo) => follo.followed_username);

    const follows_you = await Friend.findAll({
      where: {
        followed_username: req.user.username,
        username: {
          [Op.in]: followers.map((user) => user.username),
        },
      },
      attributes: ['username'],
      raw: true,
    }).map((follo_you) => follo_you.username);

    for (let i = 0; i < followers.length; i += 1) {
      if (isFollowing.includes(followers[i].username)) {
        followers[i].isFollowing = true;
      } else {
        followers[i].isFollowing = false;
      }

      if (follows_you.includes(followers[i].username)) {
        followers[i].follows_you = true;
      } else {
        followers[i].follows_you = false;
      }
    }

    if (!followers) {
      throw new Error('Something went wrong');
    }

    res.send(followers);
  } catch (e) {
    res.status(500).send();
  }
});

// GET /users/username/following?skip=0&limit=30
router.get('/users/:username/following', auth, async (req, res) => {
  /**
     * Route for getting user following
     */
  const skip = req.query.skip === undefined ? undefined : parseInt(req.query.skip, 10);
  const limit = req.query.limit === undefined ? undefined : parseInt(req.query.limit, 10);
  try {
    const following = await Friend.getUserFollowing(req.params.username, skip, limit);

    const isFollowing = await Friend.findAll({
      where: {
        username: req.user.username,
        followed_username: {
          [Op.in]: following.map((user) => user.username),
        },
      },
      raw: true,
      attributes: ['followed_username'],
    }).map((follo) => follo.followed_username);

    const follows_you = await Friend.findAll({
      where: {
        followed_username: req.user.username,
        username: {
          [Op.in]: following.map((user) => user.username),
        },
      },
      attributes: ['username'],
      raw: true,
    }).map((follo_you) => follo_you.username);

    if (!following) {
      throw new Error('Something went wrong');
    }

    for (let i = 0; i < following.length; i += 1) {
      if (follows_you.includes(following[i].username)) {
        following[i].follows_you = true;
      } else {
        following[i].follows_you = false;
      }

      if (isFollowing.includes(following[i].username)) {
        following[i].isFollowing = true;
      } else {
        following[i].isFollowing = false;
      }
    }

    res.send(following);
  } catch (e) {
    res.status(500).send();
  }
});

router.post('/users/logout', auth, async (req, res) => {
  try {
    console.log(`logout ${req.user.username}`);
    req.user.tokens = req.user.tokens.filter((token) => token !== req.token);

    await User.update(req.user, {
      where: { username: req.user.username },
    });

    await Tracker.destroy({
      where: {
        token: req.token,
      },
    });

    res.send();
  } catch (e) {
    res.status(500).send(e);
  }
});

router.post('/users/logouAll', auth, async (req, res) => {
  try {
    req.user.token = [];

    await User.update(req.user, {
      where: {
        username: req.user.username,
      },
    });

    await Tracker.destroy({
      where: {
        username: req.user.username,
      },
    });

    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
