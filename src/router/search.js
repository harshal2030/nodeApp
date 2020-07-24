const express = require('express');
const { Op } = require('sequelize');

const sequelize = require('../db');

const { User } = require('../models/User');
const Tag = require('../models/tag');
const { Post } = require('../models/Post');
const Like = require('../models/like');
const Bookmark = require('../models/bookmark');

const { optionalAuth, auth } = require('../middlewares/auth');

const router = express.Router();

/**
 * @api {GET} /search/:query?criteria=&skip=0&limit=20 Search for a query
 * @apiName search
 * @apiGroup SEARCH
 * @apiDescription endpoint for searching for tags and people.
 * usefull for giving quick overview of user searched query
 *
 * @apiUse skiplimit
 * @apiParam (url param) {String} :query term which you want to be searched
 * @apiParam (url query) {String} criteria choose on which basis you want to search.
 * Supported criteria includes <code>hashtag</code>, <code>people</code>.
 * Any other will run default algorithm
 * @apiSuccess {Array} people contains user info with matching query
 * @apiSuccess {Array} tags conatins tags of searched query.
 * @apiSuccessExample {json} success-example:
 * {
 *   "people": [
 *       ....
 *       {
 *           "username": "",
 *           "name": "",
 *           "avatarPath": "default.png"
 *       }
 *       ....
 *   ],
 *   "tags": [ // tags will be empty if criteria=people
 *        ....
 *       {
 *           "tag": "query",
 *           "posts": 3 // no. of posts with the given tag
 *       }
 *       ....
 *    ]
 * }
 * @apiUse serverError
 *
 */
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
    res.sendStatus(500);
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

/**
 *
 * @api {GET} /hashtag/:tag?what=people Search for hashtags
 * @apiName search hashtags
 * @apiGroup SEARCH
 * @apiDescription Search for hashtags present in posts and users bio.
 * @apiUse skiplimit
 * @apiUse AuthUser
 * @apiUse serverError
 *
 * @apiParam (url param) {String} :tag tag which is to be searched exclude # symbol
 * @apiParam (url query) {String=images, videos, people, posts} what=posts <p>what to
 * return from searched tag
 * @apiSuccess (Success) {Array} 200 array of posts and people according to <code>what</code> query
 * @apiSuccessExample {json} Success-Example:
 * [ // when what=posts | images | videos
 *   ....
 *  {
 *     "id": 1,
 *     "postId": "8zqc7eRxlIj1W0UfRTho-",
 *     "username": "",
 *     "title": "",
 *     "description": "lorem ipsum de isput",
 *     "mediaIncluded": null,
 *     "mediaPath": null,
 *     "likes": 0,
 *     "comments": 0,
 *     "createdAt": "2020-06-14T09:34:37.476Z",
 *     "name": "",
 *     "avatarPath": "default.png",
 *     "bookmarked": false,
 *     "liked": false
 *   },
 *   ....
 * ]
 *
 *
 * [ // when what=people
 *    ....
 *   {
 *     "id": 1,
 *     "name": "",
 *     "username": "",
 *     "avatarPath": "default.png",
 *     "bio": "in it to",
 *     "isFollowing": false,
 *     "follows_you": false
 *   }
 *   ....
 * ]
 */
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
    return res.sendStatus(500);
  }
});

/**
 *
 * @api {GET} /mention/:user?what=people Search for mentions
 * @apiName search mentions
 * @apiGroup SEARCH
 * @apiDescription Search for mentions present in posts and users bio.
 * @apiUse skiplimit
 * @apiUse AuthUser
 * @apiUse serverError
 *
 * @apiParam (url param) {String} :user username of the mentioned user to be searched
 * @apiParam (url query) {String=images, videos, people, posts} what=posts <p>what to
 * return from searched username
 * @apiSuccess (Success) {Array} 200 array of posts and people according to <code>what</code> query
 * @apiSuccessExample {json} Success-Example:
 * [ // when what=posts | images | videos
 *   ....
 *  {
 *     "id": 1,
 *     "postId": "8zqc7eRxlIj1W0UfRTho-",
 *     "username": "",
 *     "title": "",
 *     "description": "lorem ipsum de isput",
 *     "mediaIncluded": null,
 *     "mediaPath": null,
 *     "likes": 0,
 *     "comments": 0,
 *     "createdAt": "2020-06-14T09:34:37.476Z",
 *     "name": "",
 *     "avatarPath": "default.png",
 *     "bookmarked": false,
 *     "liked": false
 *   },
 *   ....
 * ]
 *
 *
 * [ // when what=people
 *    ....
 *   {
 *     "id": 1,
 *     "name": "",
 *     "username": "",
 *     "avatarPath": "default.png",
 *     "bio": "in it to",
 *     "isFollowing": false,
 *     "follows_you": false
 *   }
 *   ....
 * ]
 */
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
    return res.sendStatus(500);
  }
});

/**
 *
 * @api {GET} /mention/:term?what=people deepsearch for a term
 * @apiName deepsearch
 * @apiGroup SEARCH
 * @apiDescription Search for mentions present in posts and users bio.
 * @apiUse skiplimit
 * @apiUse AuthUser
 * @apiUse serverError
 *
 * @apiParam (url param) {String} :term term which you want to search in database.
 * @apiParam (url query) {String=images, videos, people, posts} what=posts <p>what to
 * return from searched term
 * @apiSuccess (Success) {Array} 200 array of posts and people according to <code>what</code> query
 * @apiSuccessExample {json} Success-Example:
 * [ // when what=posts | images | videos
 *   ....
 *  {
 *     "id": 1,
 *     "postId": "8zqc7eRxlIj1W0UfRTho-",
 *     "username": "",
 *     "title": "",
 *     "description": "lorem ipsum de isput",
 *     "mediaIncluded": null,
 *     "mediaPath": null,
 *     "likes": 0,
 *     "comments": 0,
 *     "createdAt": "2020-06-14T09:34:37.476Z",
 *     "name": "",
 *     "avatarPath": "default.png",
 *     "bookmarked": false,
 *     "liked": false
 *   },
 *   ....
 * ]
 *
 *
 * [ // when what=people
 *    ....
 *   {
 *     "id": 1,
 *     "name": "",
 *     "username": "",
 *     "avatarPath": "default.png",
 *     "bio": "in it to",
 *     "isFollowing": false,
 *     "follows_you": false
 *   }
 *   ....
 * ]
 */
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
    return res.sendStatus(500);
  }
});

module.exports = router;
