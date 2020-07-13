/* eslint-disable consistent-return */
/* eslint-disable camelcase */
/* eslint-disable max-len */
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const { Op, ValidationError } = require('sequelize');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const { nanoid } = require('nanoid');

const { auth, optionalAuth } = require('../middlewares/auth');
const Post = require('../models/post');
const Bookmark = require('../models/bookmark');
const User = require('../models/user');
const Like = require('../models/like');
const Friend = require('../models/friend');
const { maxDate, minDate } = require('../utils/dateFunctions');
const { hashTagPattern, handlePattern, videoMp4Pattern } = require('../utils/regexPatterns');
const {
  postImgPath, videoPath, videoThumbnailPath, imgThumbnailPath, mediaPath,
} = require('../utils/paths');

const router = express.Router();

const upload = multer({
  limits: {
    fileSize: 200 * 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|mp4|mkv)$/)) {
      return cb(Error('Unsupported files uploaded to the server'));
    }

    return cb(undefined, true);
  },
});

const mediaMiddleware = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video' },
  { name: 'commentMedia' },
]);
/**
 * @apiDefine AuthUser
 * @apiHeader (Headers) {String} Authorization auth token for checking user.
 * @apiError (Error) {Object} 401 if user can't be authenticated
 * @apiErrorExample AuthError:
 * {error: "Please authenticate"}
 */

/**
 * @apiDefine validate
 * @apiError (Error) {Object} 400 when the request doesn't adhere above standards
 * @apiErrorExample {json} Error-response:
 * {
 *  "error": "description of what went wrong" // only apply to 400 status code
 * }
 */

/**
 * @apiDefine serverError
 * @apiError (Error) {null} 500 when the server is busy or unable to process request
 */

/**
 * @apiDefine skiplimit
 * @apiParam (url query) {number} [skip=0] no. of posts to be skiped
 * @apiParam (url query) {number} [limit=20] no. of posts to be returned in request
 */

/**
 * @api {POST} /post Posting the content
 * @apiDescription Route for registering the post of user in database
 * @apiName Post
 * @apiGroup POST
 * @apiUse AuthUser
 * @apiParam (Body)  {Object} info must contain the post content
 * @apiParam (Body) {String} [info.title] title of the post
 * @apiParam (Body) {String} info.description description of the post
 * @apiParam (Body) {multipart} [image] optional image attachement
 * @apiParam (Body) {multipart} [video] optional video attachement
 * @apiParamExample {multipart} attachement and info:
 * {
 *  "info": {
 *  "title": "this is title"
 *  "description": "this is description"
 *  },
 *  "image": //attachement
 *  "video": //attachement
 * }
 * @apiParamExample {multipart} only info:
 * {
 *  "info": {
 *  "title": "" // this is optional
 *  "description": "lorem de isput"
 *  }
 * }
 * @apiParamExample {multipart} only attachement
 * {
 *  "info": {// this can be empty if you have attachemet}
 *  "image": // attachement
 *  "video": //attachement
 * }
 * @apiSuccess 201
 * @apiUse serverError
 * @apiUse validate
 */
router.post('/posts', auth, mediaMiddleware, async (req, res) => {
  try {
    const post = JSON.parse(req.body.info); // post info
    post.username = req.user.username;
    post.tags = post.description.match(hashTagPattern) === null
      ? [] : post.description.match(hashTagPattern).map((tag) => tag.slice(1));
    post.mentions = post.description.match(handlePattern) === null
      ? [] : post.description.match(handlePattern).map((handle) => handle.slice(1));

    const file = req.files;
    // process image
    if (file.image !== undefined) {
      const filename = `${nanoid()}.png`;
      const filePath = `${postImgPath}/${filename}`;
      await sharp(file.image[0].buffer).png().toFile(filePath);
      sharp(file.image[0].buffer).jpeg()
        .blur()
        .resize({ width: 100, height: 100 })
        .toFile(`${imgThumbnailPath}/${filename}`);

      post.mediaPath = `${filename}`;
      post.mediaIncluded = 'image';
    }

    // process video
    if (file.video !== undefined) {
      const filename = `${nanoid()}.mp4`;
      const filePath = `${videoPath}/${filename}`;
      fs.writeFileSync(filePath, file.video[0].buffer, { encoding: 'ascii' });

      // generate thumbnail from video at 1 sec
      ffmpeg(filePath).screenshots({
        timestamps: [1],
        filename: `${filename}.jpeg`,
        folder: videoThumbnailPath,
      });
      post.mediaPath = `${filename}`;
      post.mediaIncluded = 'video';
    }
    await Post.create(post);
    res.status(201).send();
  } catch (e) {
    if (e instanceof ValidationError) {
      res.status(400).send({ error: e.message });
    }
    res.status(500).send();
  }
});
/**
 * @api {DELETE} /posts Delete post
 * @apiName Delete Post
 * @apiDescription Deletes the post of user on succesfull authentication
 * @apiGroup POST
 * @apiUse AuthUser
 * @apiParam {String} postId postId id of the post
 * @apiSuccess (200) {null} it returns nothing
 * @apiParamExample  {json} Request-Example:
 * {
 *     postId: "23423+_Sdf" // id of the post
 * }
 * @apiUser serverError
 * @apiIgnore
 */
router.delete('/posts', auth, async (req, res) => {
  try {
    const post = await Post.findOne({
      where: {
        postId: req.body.postId,
        username: req.user.username,
      },
    });

    if (!post) {
      throw new Error('No such post exists');
    }

    post.removeReplyMedia();

    if (post.mediaIncluded) {
      if (videoMp4Pattern.test(post.mediaPath)) {
        const filePath = mediaPath + post.mediaPath;
        const thumbPath = `${mediaPath}/videos/thumbnails/${post.mediaPath.slice(8)}.webp`;
        fs.unlinkSync(filePath);
        fs.unlinkSync(thumbPath);
      } else {
        const filePath = mediaPath + post.mediaPath;
        fs.unlinkSync(filePath);
      }
    }

    await Post.destroy({
      where: {
        [Op.or]: [
          {
            postId: req.body.postId,
            username: req.user.username,
          },
          {
            parentId: req.body.postId,
          },
        ],
      },
    });

    res.sendStatus(200);
  } catch (e) {
    res.sendStatus(500);
  }
});

// GET /posts?skip = 0&limit = 20
/**
 * @api {GET} /posts?skip=0&limit=20 Get user home feed
 * @apiName User home feed
 * @apiDescription Get user home feed.
 * @apiGroup POST
 * @apiUse skiplimit
 * @apiUse AuthUser
 * @apiSuccess {Object[]} data array of posts
 * @apiSuccess {String[]} likeIds array of ids which user liked
 * @apiSuccess {string[]} bookmarkIds array of ids which user bookmarked
 * @apiSuccess {Date} maxDate latest date present in data
 * @apiSuccess {Date} minDate lowest date present in data
 * @apiSuccessExample {json} Success-Response:
 * {
 *  data: [
 *    ....
 *    {
 *      avatarPath: "", // name of avatar file
 *      name: "",
 *      id: number,
 *      postId: "wetwse+f" // id of post,
 *      username: ""
 *      title: "",
 *      description: "",
 *      mediaIncluded: "" //type of media included in post,
 *      likes: number,
 *      comments: number,
 *      createdAt: Date, // date on which post was created,
 *      bookmarked: bool, // if user has bookmarked post,
 *      liked: bool, // if user has liked post
 *    }
 *    ....
 *  ],
 *  likeIds: [],
 *  bookmarkIds: [],
 *  maxDate: Date,
 *  minDate: Date,
 * }
 * @apiUse serverError
 */
router.get('/posts', auth, async (req, res) => {
  const skip = req.query.skip === undefined ? undefined : parseInt(req.query.skip, 10);
  const limit = req.query.limit === undefined ? undefined : parseInt(req.query.limit, 10);
  try {
    const posts = await Post.getUserFeed(req.user.username, skip, limit);
    const bookmarkRef = Bookmark.getUserBookmarksIds(
      posts.map((post) => post.postId),
      req.user.username,
    );
    const likesRef = Like.getUserLikeIds(
      posts.map((post) => post.postId),
      req.user.username,
    );

    const parallelResp = await Promise.all([bookmarkRef, likesRef]);
    const bookmark = parallelResp[0];
    const likes = parallelResp[1];

    const data = Post.addUserInfo(posts, bookmark, likes);

    res.send({
      data,
      likeId: likes,
      bookmarkIds: bookmark,
      maxDate: maxDate(posts),
      minDate: minDate(posts),
    });
  } catch (e) {
    res.status(500).send();
  }
});

/**
 * @api {GET} /posts/:username/media?skip=0&limit=20 Get user post media
 * @apiName media route
 * @apiDescription Route for getting the any media posts.
 * @apiGroup POST
 * @apiUse skiplimit
 * @apiUse AuthUser
 * @apiUse serverError
 * @apiParam (url params) {String} :username username of user whose media is to be fetched
 * @apiSuccess {Object[]} array array of posts
 * @apiSuccessExample {json} Success-Response:
 * [
 * ....
 * {
 *     likes: number,
 *     comments: number,
 *     postid: "",
 *     id: "",
 *     mediaIncluded: "",
 * }
 * ....
 * ]
 */
// GET /posts/username/media?skip=0&limit=20
router.get('/posts/:username/media', auth, async (req, res) => {
  /**
     * Route for getting list url for images for specified user
     * 200 for success
     * 404 for no media or non associated user
     */
  const skip = req.query.skip === undefined ? 0 : parseInt(req.query.skip, 10);
  const limit = req.query.limit === undefined ? 20 : parseInt(req.query.limit, 10);

  try {
    const media = await Post.findAll({
      where: {
        username: req.params.username,
        mediaPath: {
          [Op.not]: null,
        },
      },
      raw: true,
      attributes: ['likes', 'comments', 'postId', 'id', 'mediaIncluded'],
      offset: skip,
      limit,
    });

    res.status(200).send(media);
  } catch (e) {
    res.sendStatus(500);
  }
});

/**
 * @api {GET} /posts/:username/stars?skip=0&limit=20 Get user stars
 * @apiName Get user stars
 * @apiDescription Route for getting user stars
 * @apiGroup POST
 * @apiParam (url param) {String} :username username of user whose stars are to fetched
 * @apiUse AuthUser
 * @apiUse serverError
 * @apiUse skiplimit
 * @apiSuccess {Object[]} array array of posts which user stared
 * @apiSuccessExample {json} Success-Response:
 * [
 * ....
 * {
 *      avatarPath: "", // name of avatar file
 *      name: "",
 *      id: number,
 *      postId: "wetwse+f" // id of post,
 *      username: ""
 *      title: "",
 *      description: "",
 *      mediaIncluded: "" //type of media included in post,
 *      likes: number,
 *      comments: number,
 *      createdAt: Date, // date on which post was created,
 *      bookmarked: bool, // if user has bookmarked post,
 *      liked: bool, // if user has liked post
 * }
 * ....
 * ]
 */
// GET /posts/username/stars?skip=0&limit=20
router.get('/posts/:username/stars', auth, async (req, res) => {
  /**
     * route to get stars of user
     */
  const skip = req.query.skip === undefined ? undefined : parseInt(req.query.skip, 10);
  const limit = req.query.limit === undefined ? undefined : parseInt(req.query.limit, 10);
  try {
    const likes = await Like.getUserLikes(req.params.username, skip, limit);
    const idsRef = Like.getUserLikeIds(
      likes.map((i) => i.postId),
      req.user.username,
    );
    const bookIdsRef = Bookmark.getUserBookmarksIds(
      likes.map((i) => i.postId),
      req.user.username,
    );

    const [ids, bookIds] = await Promise.all([idsRef, bookIdsRef]);

    const data = Post.addUserInfo(likes, bookIds, ids);
    res.send(data);
  } catch (e) {
    res.status(500).send();
  }
});

/**
 * @api {POST} /posts/:postId/comment Post comment on a post
 * @apiName post comment
 * @apiDescription Register a comment on a post
 * @apiGroup POST
 * @apiUse AuthUser
 * @apiParam (url param) {String} postId of the post on which comment is to be registered
 * @apiParam (body) {Object} info contains comment content
 * @apiParam (body) {String} info.description description of the comment
 * @apiParam (body) {multipart} commentMedia media attachement to comment body
 * @apiParamExample {multipart} example:
 * {
 *  info: { // this can be empty if commentMedia is not empty
 *  description: "" // comment body
 * },
 * commentMedia: // attachements
 * }
 * @apiSuccess 201
 * @apiUse validate
 * @apiUse serverError
 */
router.post(
  '/posts/:postId/comment',
  auth,
  mediaMiddleware,
  async (req, res) => {
    /**
         * Create comment reference to parent id
         * 201 for success
         * 400 for failure
         */
    try {
      const post = await Post.findOne({ where: { postId: req.params.postId } });
      if (!post) {
        throw new Error('Invalid request');
      }

      const raw = JSON.parse(req.body.info);

      const commentBody = {
        replyTo: post.postId,
        parentId: post.parentId || post.postId,
        username: req.user.username,
        description: raw.commentValue,
        mediaPath: undefined,
        mediaIncluded: null,
      };

      const file = req.files;
      if (file.commentMedia !== undefined) {
        const filename = `${nanoid()}.png`;
        const filePath = `${postImgPath}/${filename}`;
        await sharp(file.commentMedia[0].buffer).png().toFile(filePath);
        sharp(file.commentMedia[0].buffer).jpeg()
          .blur()
          .resize({ width: 100, height: 100 })
          .toFile(`${imgThumbnailPath}/${filename}`);
        commentBody.mediaPath = `${filename}`;
        commentBody.mediaIncluded = 'image';
      }

      const comment = await Post.comment(commentBody);

      res.status(201).send({ comment });
    } catch (e) {
      if (e instanceof ValidationError) {
        res.status(400).send({ error: e.message });
      }
      res.status(500).send();
    }
  },
);

/**
 * @api {GET} /posts/:postId/comments?skip=0&limit=20 Get comments on a post
 * @apiName get comments
 * @apiDescription Get comments of a post based by it's ID
 * @apiGroup POST
 * @apiUse skiplimit
 * @apiUse AuthUser
 * @apiUse serverError
 * @apiParam (url param) {String} :postId postId whose comments are to be fetched
 * @apiSuccess (200) {Array} array get array of comments on taht post
 * @apiSuccessExample {type} Success-Response:
 * [
 * ....
 * {
 *  "postId": "",
 *   username: "",
 *   title: "",
 *   id: 6,
 *   description: ,
 *   mediaIncluded: "",
 *   likes: 0,
 *   comments: 0,
 *   createdAt: Date,
 *   name: "",
 *   avatarPath: "default.png"
 * }
 * ....
 * ]
 */
// GET /posts/postid/comment?skip=0&limit=10
router.get('/posts/:postId/comment', auth, async (req, res) => {
  /**
     * Get comment of specified post
     * 201 for success
     * 500 for failure
     */
  const skip = req.query.skip === undefined ? undefined : parseInt(req.query.skip, 10);
  const limit = req.query.limit === undefined ? undefined : parseInt(req.query.limit, 10);
  try {
    const comments = await Post.getComments(req.params.postId, skip, limit);
    res.send(comments);
  } catch (e) {
    res.status(500).send();
  }
});

/**
 * @api {PATCH} /posts/like Register like on a post
 * @apiName star a post
 * @apiDescription atuomatically register/unregister like on a post
 * @apiGroup POST
 * @apiParam (body) {String} postId postId of post on which like is to be updated
 * @apiUse serverError
 * @apiUse AuthUser
 * @apiParamExample  {json} Example:
 * {
 *     postId: "ert34-sdfg" // id of the post
 * }
 * @apiSuccess (200) {String} likes no. of likes on the post
 * @apiSuccessExample {type} Success-Response:
 * {
 *     likes: number
 * }
 */
router.patch('/posts/like', auth, async (req, res) => {
  /**
     * Update like insert 1 if not present, delete if present
     * 200 for insertion
     * 400 for deletion
     */
  try {
    const didExists = await Post.findOne({
      where: { postId: req.body.postId },
    });
    if (!didExists) {
      throw new Error('Invalid request');
    }

    const isPresent = await Like.findOne({
      where: {
        postId: req.body.postId,
        likedBy: req.user.username,
      },
    });

    if (isPresent) {
      await Like.destroy({
        where: {
          postId: req.body.postId,
          likedBy: req.user.username,
        },
      });
      Post.increment({ likes: -1 }, { where: { postId: req.body.postId } });
      const likes = await Like.count({ where: { postId: req.body.postId } });
      return res.status(200).send({ likes });
    }

    const likes = await Post.like(
      req.body.postId,
      req.user.username,
    );

    res.send({ likes });
  } catch (e) {
    res.sendStatus(500);
  }
});

/**
 * @api {GET} /posts/:postId/stargazers?skip=0&limit=20 Get stargazers on a post
 * @apiName stargazers
 * @apiGroup POST
 * @apiDescription Get user who starred a post by its postId
 * @apiParam (url param) {String} :postId postId whose stargazers are to be fetched
 * @apiUse AuthUser
 * @apiUse serverError
 * @apiUse skiplimit
 * @apiSuccess (200) {Object[]} array array of users who liked that post
 * @apiSuccessExample {type} Success-Response:
 * {
 *  username: "",
 *  avatarPath: default.png,
 *  name: "",
 *  id: 1,
 *  isFollowing: bool,
 *  follows_you: bool
 * }
 */
// Get /posts/uuid4/stargazers?skip=0&limit=20
router.get('/posts/:postId/stargazers', auth, async (req, res) => {
  /**
     * Get users who liked a specific post
     * 200 for successfull retrieval
     * 500 for errors
     */
  const skip = req.query.skip === undefined ? undefined : parseInt(req.query.skip, 10);
  const limit = req.query.limit === undefined ? undefined : parseInt(req.query.limit, 10);
  try {
    const stargazers = await Like.getStarGazers(req.params.postId, skip, limit);
    const isFollowing = await Friend.findAll({
      where: {
        username: req.user.username,
        followed_username: {
          [Op.in]: stargazers.map((user) => user.username),
        },
      },
      attributes: ['followed_username'],
      raw: true,
    }).map((follo) => follo.followed_username);
    const follows_you = await Friend.findAll({
      where: {
        username: {
          [Op.in]: stargazers.map((user) => user.username),
        },
        followed_username: req.user.username,
      },
      attributes: ['username'],
      raw: true,
    }).map((follo) => follo.username);

    for (let i = 0; i < stargazers.length; i += 1) {
      if (isFollowing.includes(stargazers[i].username)) {
        stargazers[i].isFollowing = true;
      } else {
        stargazers[i].isFollowing = false;
      }

      if (follows_you.includes(stargazers[i].username)) {
        stargazers[i].follows_you = true;
      } else {
        stargazers[i].follows_you = false;
      }
    }
    res.send(stargazers);
  } catch (e) {
    res.status(500).send();
  }
});


/**
 * @api {GET} /posts/:username?skip=0&limit=20 Get posts by certain user
 * @apiName user posts
 * @apiGroup POST
 * @apiDescription Get posts posted by specific user
 * @apiParam (url param) {String} :username username whose posts are to be fetched
 * @apiUse serverError
 * @apiUse skiplimit
 * @apiSuccess (200) {Object[]} array array of posts posted by user
 * @apiSuccessExample {type} Success-Response:
 * [
 * ....
 * {
 *  "postId": "",
 *   username: "",
 *   title: "",
 *   id: 6,
 *   description: ,
 *   mediaIncluded: "",
 *   likes: 0,
 *   comments: 0,
 *   createdAt: Date,
 *   name: "",
 *   avatarPath: "default.png"
 * }
 * ....
 * ]
 */
// GET /posts/username?skip=0&limit=20
router.get('/posts/:username', optionalAuth, async (req, res) => {
  /**
     * Route for posts of a user (req.params.username)
     * 404 if no posts
     * 200 with atleast one post
     */
  const skip = req.query.skip === undefined ? 0 : parseInt(req.query.skip, 10);
  const limit = req.query.limit === undefined ? 10 : parseInt(req.query.limit, 10);
  try {
    const user = User.findOne({
      where: {
        username: req.user.username,
      },
    });

    if (!user) {
      throw new Error();
    }
    const { username } = req.params;
    const posts = await Post.getUserPosts(username, skip, limit);
    if (req.user !== undefined) {
      const likesRef = Like.getUserLikeIds(
        posts.map((post) => post.postId),
        req.user.username,
      );

      const bookRef = Bookmark.getUserBookmarksIds(posts.map((post) => post.postId), req.user.username);

      const parallelResp = await Promise.all([bookRef, likesRef]);

      const authPosts = Post.addUserInfo(posts, parallelResp[0], parallelResp[1]);
      return res.send(authPosts);
    }

    res.send(posts);
  } catch (e) {
    res.status(400).send(e);
  }
});

// router.get("/posts/:username/:postId", async (req, res) => {
//     try {
//         const post = await Post.findOne({
//             where: {
//                 postId: req.params.postId,
//                 username
//             },
//             attributes: {
//                 exclude: ["updatedAt"],
//             },
//             raw: true,
//         });

//         if (!post) {
//             throw new Error("No such post found");
//         }

//         if (post.replyTo !== null) {
//             const parent = await Post.findOne({
//                 where: {
//                     postId: post.replyTo,
//                 },
//                 attributes: ["username"],
//                 raw: true,
//             });

//             post["parentUsername"] = parent.username;
//         }

//         res.send(post);
//     } catch (e) {
//         res.sendStatus(404);
//     }
// });

router.get('/posts/trends/:username', auth, (req, res) => {
  res.send('coming soon');
});

module.exports = router;
