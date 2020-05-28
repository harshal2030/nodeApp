/* eslint-disable consistent-return */
/* eslint-disable camelcase */
/* eslint-disable max-len */
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const { v4 } = require('uuid');
const { Op } = require('sequelize');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');

const { auth, optionalAuth } = require('../middlewares/auth');
const Post = require('../models/post');
const Bookmark = require('../models/bookmark');
const Like = require('../models/like');
const Friend = require('../models/friend');
const { maxDate, minDate } = require('../utils/dateFunctions');
const { hashTagPattern, handlePattern, videoMp4Pattern } = require('../utils/regexPatterns');
const {
  postImgPath, videoPath, commentImgPath, thumbnailPath, mediaPath,
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

router.post('/posts', auth, mediaMiddleware, async (req, res) => {
  /**
     * Route for posting the post from user.
     * user info from auth middleware (req.body)
     * Current token from auth middleware (req.token)
     * name for image = image
     * post info contained in req.body.info
     * imagePath: media/images/post
     * videoPath: media/videos
     * thumbnailPath: media/videos/thumbnail
     * 201 for success
     */
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
      console.log('if of imAGE');
      const filename = `${v4()}.webp`;
      const filePath = `${postImgPath}/${filename}`;
      await sharp(file.image[0].buffer).webp({ lossless: true }).toFile(filePath);
      post.mediaPath = `/images/posts/${filename}`;
      post.mediaIncluded = true;
    }

    // process video
    if (file.video !== undefined) {
      console.log('if of video');
      const filename = `${v4()}.mp4`;
      const filePath = `${videoPath}/${filename}`;
      fs.writeFileSync(filePath, file.video[0].buffer, { encoding: 'ascii' });

      // generate thumbnail from video at 1 sec
      ffmpeg(filePath).screenshots({
        timestamps: [1],
        filename: `${filename}.webp`,
        folder: thumbnailPath,
      });
      post.mediaPath = `/videos/${filename}`;
      post.mediaIncluded = true;
    }
    await Post.create(post);
    res.status(201).send();
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

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
    res.sendStatus(400);
  }
});

// GET /posts?skip = 0&limit = 20
router.get('/posts', auth, async (req, res) => {
  /**
     * Route for home feed of a user
     * Full function in posts
     * 200 for success
     */
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
    console.log(e);
    res.status(400).send(e);
  }
});

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
      attributes: ['likes', 'comments', 'postId', 'id'],
      offset: skip,
      limit,
    });

    for (let i = 0; i < media.length; i += 1) {
      if (videoMp4Pattern.test(media[i].mediaPath)) {
        media[i].video = true;
      } else {
        media[i].video = false;
      }
    }

    res.status(200).send(media);
  } catch (e) {
    res.sendStatus(500);
  }
});

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
    console.log(e);
    res.status(500).send();
  }
});

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
        mediaIncluded: false,
      };

      const file = req.files;
      if (file.commentMedia !== undefined) {
        console.log('if of imAGE');
        const filename = `${v4()}.webp`;
        const filePath = `${commentImgPath}/${filename}`;
        await sharp(file.commentMedia[0].buffer).webp({ lossless: true }).toFile(filePath);
        commentBody.mediaPath = `/images/comments/${filename}`;
        commentBody.mediaIncluded = true;
      }

      const comment = await Post.comment(commentBody);

      res.status(201).send({ comment });
    } catch (e) {
      console.log(e);
      res.status(400).send();
    }
  },
);

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
    for (let i = 0; i < comments.length; i += 1) {
      comments[i].avatarPath = process.env.TEMPURL + comments[i].avatarPath;
      comments[i].mediaPath = process.env.TEMPURL + comments[i].mediaPath;
    }
    res.send(comments);
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

router.patch('/posts/:postId/like', auth, async (req, res) => {
  /**
     * Update like insert 1 if not present, delete if present
     * 200 for insertion
     * 400 for deletion
     */
  try {
    const didExists = await Post.findOne({
      where: { postId: req.params.postId },
    });
    if (!didExists) {
      throw new Error('Invalid request');
    }

    const isPresent = await Like.findOne({
      where: {
        postId: req.params.postId,
        likedBy: req.body.username,
        postedBy: req.body.postedBy,
      },
    });

    if (isPresent) {
      throw new Error('Present');
    }

    const likes = await Post.like(
      req.params.postId,
      req.body.username,
      req.body.postedBy,
    );
    res.send({ likes });
  } catch (e) {
    if (e.toString() === 'Error: Present') {
      await Like.destroy({
        where: {
          postId: req.params.postId,
          likedBy: req.body.username,
          postedBy: req.body.postedBy,
        },
      });
      Post.increment({ likes: -1 }, { where: { postId: req.params.postId } });
    }
    const likes = await Like.count({ where: { postId: req.params.postId } });
    res.status(400).send({ likes });
  }
});

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
      stargazers[i].avatarPath = process.env.TEMPURL + stargazers[i].avatarPath;

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
    console.log(e);
    res.status(500).send();
  }
});

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
    console.log(e);
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
