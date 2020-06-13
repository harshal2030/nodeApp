/* eslint-disable max-len */
const express = require('express');
const { Op } = require('sequelize');

const { auth, optionalAuth } = require('../middlewares/auth');
const Bookmark = require('../models/bookmark');
const Like = require('../models/like');
const Post = require('../models/post');
const Block = require('../models/block');
const User = require('../models/user');
const Tag = require('../models/tag');
const sequelize = require('../db');

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

router.get('/hashtag/:tag', optionalAuth, async (req, res) => {
  const skip = req.query.skip === undefined ? 0 : parseInt(req.query.skip, 10);
  const limit = req.query.limit === undefined ? 10 : parseInt(req.query.limit, 10);
  try {
    const { what } = req.query;
    const tag = req.query.what === 'people' ? `#${req.params.tag}` : req.params.tag;

    let query;
    switch (what) {
      case 'images':
        query = `SELECT posts."id", posts."postId", posts."username", posts."title",
        posts."description", posts."mediaIncluded", posts."mediaPath",
        posts."likes", posts."comments", posts."createdAt", users."name", users."username",
        users."avatarPath" FROM posts INNER JOIN users USING (username) 
        WHERE posts."mediaIncluded" = 'image' AND :tag = ANY(posts."tags") 
        OFFSET :skip LIMIT :limit`;
        break;
      case 'videos':
        query = `SELECT posts."id", posts."postId", posts."username", posts."title",
        posts."description", posts."mediaIncluded", posts."mediaPath",
        posts."likes", posts."comments", posts."createdAt", users."name", users."username",
        users."avatarPath" FROM posts INNER JOIN users USING (username) 
        WHERE posts."mediaIncluded" = 'video' AND 'horror' = ANY(posts."tags")
        OFFSET :skip LIMIT :limit`;
        break;
      case 'people':
        query = `SELECT id, name, username, "avatarPath", bio FROM users WHERE bio ~ :tag 
        OFFSET :skip LIMIT :limit`;
        break;
      case 'posts':
      default:
        query = `SELECT posts."id", posts."postId", posts."username", posts."title",
        posts."description", posts."mediaIncluded", posts."mediaPath",
        posts."likes", posts."comments", posts."createdAt", users."name", 
        users."username", users."avatarPath" FROM posts
        INNER JOIN users USING (username) WHERE :tag = ANY(posts."tags") OFFSET :skip LIMIT :limit`;
        break;
    }

    const rawResult = await sequelize.query(query, {
      replacements: { tag, skip, limit },
      raw: true,
    });

    const result = rawResult[0];

    if (req.user !== undefined) {
      if (what !== 'people') {
        const likeRef = Like.getUserLikeIds(result.map((post) => post.postId), req.user.username);
        const bookRef = Bookmark.getUserBookmarksIds(result.map((post) => post.postId), req.user.username);

        const [likes, books] = await Promise.all([likeRef, bookRef]);

        const authResult = Post.addUserInfo(result, books, likes);
        return res.send(authResult);
      }

      if (what === 'people') {
        const authResult = await User.getUserInfo(result, req.user.username);
        return res.send(authResult);
      }
    }

    return res.send(result);
  } catch (e) {
    console.log(e);
    return res.sendStatus(400);
  }
});

module.exports = router;
