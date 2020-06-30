const express = require('express');
const { Op } = require('sequelize');

const sequelize = require('../db');

const User = require('../models/user');
const Tag = require('../models/tag');
const Post = require('../models/post');
const Like = require('../models/like');
const Bookmark = require('../models/bookmark');

const { optionalAuth, auth } = require('../middlewares/auth');

const router = express.Router();

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
    res.sendStatus(400);
  }
});

router.get('/autocomplete/:query', async (req, res) => {
  const skip = req.query.skip === undefined ? 0 : parseInt(req.query.skip, 10);
  const limit = req.query.limit === undefined ? 6 : parseInt(req.query.limit, 10);
  try {
    const { query } = req.params;
    const { criteria } = req.query;

    let result;
    switch (criteria) {
      case 'people':
        result = await User.findAll({
          where: {
            username: {
              [Op.startsWith]: query,
            },
          },
          offset: skip,
          limit,
          attributes: ['username', 'name', 'avatarPath'],
        });
        break;
      case 'hashtag':
      default:
        result = await Tag.findAll({
          where: {
            tag: {
              [Op.like]: `%${query}%`,
            },
            type: '#',
          },
          offset: skip,
          limit,
        });
        break;
    }

    res.send(result);
  } catch (e) {
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
        INNER JOIN users USING (username) WHERE :tag = ANY(posts."tags")
        ORDER BY posts."likes" OFFSET :skip LIMIT :limit`;
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
        const bookRef = Bookmark.getUserBookmarksIds(
          result.map((post) => post.postId), req.user.username,
        );

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
    return res.sendStatus(400);
  }
});

router.get('/mention/:user', optionalAuth, async (req, res) => {
  const skip = req.query.skip === undefined ? 0 : parseInt(req.query.skip, 10);
  const limit = req.query.limit === undefined ? 10 : parseInt(req.query.limit, 10);
  try {
    const { what } = req.query;
    const { user } = req.params;

    let query;
    switch (what) {
      case 'images':
        query = `SELECT posts."id", posts."postId", posts."username", posts."title",
        posts."description", posts."mediaIncluded", posts."mediaPath",
        posts."likes", posts."comments", posts."createdAt", users."name", users."username",
        users."avatarPath" FROM posts INNER JOIN users USING (username) 
        WHERE posts."mediaIncluded" = 'image' AND :user = ANY(posts."mentions") 
        OFFSET :skip LIMIT :limit`;
        break;
      case 'videos':
        query = `SELECT posts."id", posts."postId", posts."username", posts."title",
        posts."description", posts."mediaIncluded", posts."mediaPath",
        posts."likes", posts."comments", posts."createdAt", users."name", users."username",
        users."avatarPath" FROM posts INNER JOIN users USING (username) 
        WHERE posts."mediaIncluded" = 'video' AND :user = ANY(posts."mentions") 
        OFFSET :skip LIMIT :limit`;
        break;
      case 'people':
        query = `SELECT id, name, username, "avatarPath", bio FROM users WHERE username = :user
        OFFSET :skip LIMIT :limit`;
        break;
      case 'posts':
      default:
        query = `SELECT posts."id", posts."postId", posts."username", posts."title",
        posts."description", posts."mediaIncluded", posts."mediaPath",
        posts."likes", posts."comments", posts."createdAt", users."name", 
        users."username", users."avatarPath" FROM posts
        INNER JOIN users USING (username) WHERE :user = ANY(posts."mentions")
        ORDER BY posts."likes" OFFSET :skip LIMIT :limit`;
        break;
    }

    const rawResult = await sequelize.query(query, {
      replacements: { user, skip, limit },
      raw: true,
    });

    const result = rawResult[0];

    if (req.user !== undefined) {
      if (what !== 'people') {
        const likeRef = Like.getUserLikeIds(result.map((post) => post.postId), req.user.username);
        const bookRef = Bookmark.getUserBookmarksIds(
          result.map((post) => post.postId), req.user.username,
        );

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
    return res.sendStatus(400);
  }
});

router.get('/deepsearch/:term', auth, async (req, res) => {
  const skip = req.query.skip === undefined ? 0 : parseInt(req.query.skip, 10);
  const limit = req.query.limit === undefined ? 6 : parseInt(req.query.limit, 10);
  try {
    const { term } = req.params;
    const { what } = req.query;

    let query;
    switch (what) {
      case 'images':
        query = `SELECT posts."id", posts."postId", posts."username", posts."title",
        posts."description", posts."mediaIncluded", posts."mediaPath",
        posts."likes", posts."comments", posts."createdAt", users."name", users."username",
        users."avatarPath" FROM posts INNER JOIN users USING (username) 
        WHERE posts."mediaIncluded" = 'image' AND (posts.description ~ :term OR posts.title ~ :term) 
        OFFSET :skip LIMIT :limit`;
        break;
      case 'videos':
        query = `SELECT posts."id", posts."postId", posts."username", posts."title",
        posts."description", posts."mediaIncluded", posts."mediaPath",
        posts."likes", posts."comments", posts."createdAt", users."name", users."username",
        users."avatarPath" FROM posts INNER JOIN users USING (username) 
        WHERE posts."mediaIncluded" = 'video' AND (posts.description ~ :term OR posts.title ~ :term) 
        OFFSET :skip LIMIT :limit`;
        break;
      case 'people':
        query = `SELECT id, name, username, "avatarPath", bio FROM users WHERE username ~ :term 
        OR name ~ :term OR bio ~ :term OFFSET :skip LIMIT :limit`;
        break;
      case 'posts':
      default:
        query = `SELECT posts."id", posts."postId", posts."username", posts."title",
        posts."description", posts."mediaIncluded", posts."mediaPath",
        posts."likes", posts."comments", posts."createdAt", users."name", 
        users."username", users."avatarPath" FROM posts
        INNER JOIN users USING (username) WHERE posts.description ~ :term OR posts.title ~ :term
        ORDER BY posts."likes" OFFSET :skip LIMIT :limit`;
        break;
    }

    const rawResult = await sequelize.query(query, {
      replacements: { term, skip, limit },
      raw: true,
    });

    const result = rawResult[0];

    if (what === 'people') {
      const authResult = await User.getUserInfo(result, req.user.username);
      return res.send(authResult);
    }

    const likeRef = Like.getUserLikeIds(result.map((post) => post.postId), req.user.username);
    const bookRef = Bookmark.getUserBookmarksIds(
      result.map((post) => post.postId), req.user.username,
    );

    const [likes, books] = await Promise.all([likeRef, bookRef]);
    const authResult = Post.addUserInfo(result, books, likes);
    return res.send(authResult);
  } catch (e) {
    return res.sendStatus(400);
  }
});

module.exports = router;
