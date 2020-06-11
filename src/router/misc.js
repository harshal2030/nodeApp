/* eslint-disable max-len */
const express = require('express');
const { Op } = require('sequelize');

const { auth } = require('../middlewares/auth');
const Bookmark = require('../models/bookmark');
const Like = require('../models/like');
const Post = require('../models/post');
const Block = require('../models/block');
const User = require('../models/user');
const Tag = require('../models/tag');

const router = express.Router();

// POST /misc?option=bookmark
router.post('/misc', auth, async (req, res) => {
  /**
     * Route for adding misc to database
     * 201 for success, bookmark registered
     * 403 for removal, bookmark removed
     *
     * ?options=
     * 1. bookmark = gem on frontend, save fav posts
     */
  try {
    if (req.query.option === 'bookmark') { // algo for bookmarks
      const bookmarkAdded = await Bookmark.addBookmark(req.user.username, req.body.postId);
      if (bookmarkAdded) {
        res.status(200).send();
      } else { // will get removed automatically
        res.status(200).send();
      }
    }
  } catch (e) {
    res.status(400).send(e);
  }
});

// GET /posts/misc?option=bookmark&skip=0&limit=20
router.get('/misc', auth, async (req, res) => {
  /**
     * Route to fetch user misc posts
     * 200 success
     */
  const skip = req.query.skip === undefined ? 0 : parseInt(req.query.skip, 10);
  const limit = req.query.limit === undefined ? 20 : parseInt(req.query.limit, 10);
  try {
    if (req.query.option === 'bookmark') {
      const bookmarks = await Bookmark.getUserBookmarks(req.user.username, skip, limit);
      const likes = await Like.getUserLikeIds(bookmarks.map((mark) => mark.postId), req.user.username);

      const data = Post.addUserInfo(bookmarks, bookmarks.map((book) => book.postId), likes);
      res.send(data);
    }
  } catch (e) {
    res.status(500).send(e);
  }
});

router.post('/block/user', auth, async (req, res) => {
  try {
    const doExists = await User.findOne({
      where: {
        username: req.user.username,
      },
    });

    if (!doExists) {
      throw new Error('No such user exists');
    }

    // default type value is block
    const block = await Block.create({
      blocked: req.body.username,
      blockedBy: req.user.username,
    });

    block.performBlock();

    res.sendStatus(200);
  } catch (e) {
    res.sendStatus(400);
  }
});

router.delete('/block/user', auth, async (req, res) => {
  try {
    const removedBlock = await Block.destroy({
      where: {
        blocked: req.body.username,
        blockedBy: req.user.username,
      },
    });

    if (!removedBlock) {
      throw new Error();
    }

    res.sendStatus(200);
  } catch (e) {
    res.sendStatus(400);
  }
});

router.post('/mute/user', auth, async (req, res) => {
  try {
    const instance = Block.findOrCreate({
      where: {
        blocked: req.body.username,
        blockedBy: req.user.username,
        type: 'mute',
      },
    });

    if (!instance) {
      throw new Error('User not exists');
    }

    res.sendStatus(200);
  } catch (e) {
    res.sendStatus(400);
  }
});

router.delete('/mute/user', auth, async (req, res) => {
  try {
    const removedMute = await Block.destroy({
      where: {
        blocked: req.body.username,
        blockedBy: req.user.username,
        type: 'mute',
      },
    });

    if (!removedMute) {
      throw new Error();
    }

    res.sendStatus(200);
  } catch (e) {
    res.sendStatus(400);
  }
});


// GET /search/:query?skip=0&limit=6&criteria=hashtag
router.get('/searchs/:query', async (req, res) => {
  const skip = req.query.skip === undefined ? 0 : parseInt(req.query.skip, 10);
  const limit = req.query.limit === undefined ? 6 : parseInt(req.query.limit, 10);
  try {
    const { criteria } = req.query;
    const { query } = req.params;

    let tags;
    let people;

    switch (criteria) {
      case 'hashtag':
        tags = await Tag.findAll({
          where: {
            tag: {
              [Op.like]: `${query}%`,
            },
          },
          attributes: ['tag', 'posts'],
          raw: true,
          offset: skip,
          limit,
        });

        people = await User.findAll({
          where: {
            bio: {
              [Op.like]: `%#${query}%`,
            },
          },
          raw: true,
          attributes: ['username', 'name', 'avatarPath'],
          offset: skip,
          limit,
        });

        break;
      case 'people':
        tags = [];

        people = await User.findAll({
          where: {
            username: {
              [Op.like]: `${query}%`,
            },
          },
          raw: true,
          attributes: ['username', 'name', 'avatarPath'],
          offset: skip,
          limit,
        });
        break;
      default:
        tags = await Tag.findAll({
          where: {
            tag: {
              [Op.startsWith]: query,
            },
          },
          raw: true,
          attributes: ['tag', 'posts'],
          offset: skip,
          limit,
        });

        people = await User.findAll({
          where: {
            username: {
              [Op.like]: `${query}%`,
            },
          },
          raw: true,
          attributes: ['username', 'name', 'avatarPath'],
          offset: skip,
          limit,
        });
        break;
    }

    res.send({ people, tags });
  } catch (e) {
    console.log(e);
    res.sendStatus(400);
  }
});

module.exports = router;
