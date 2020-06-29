/* eslint-disable consistent-return */
const express = require('express');
const fs = require('fs');

const User = require('../models/user');
const Friend = require('../models/friend');
const Post = require('../models/post');
const { optionalAuth } = require('../middlewares/auth');
const {
  publicPath, postImgPath, videoPath, videoThumbnailPath, imgThumbnailPath,
} = require('../utils/paths');
const { videoMp4Pattern } = require('../utils/regexPatterns');
const sequelize = require('../db');

const router = express.Router();

/**
 * @api {GET} /users/:username/avatar Get user avatar image
 * @apiName avatar image
 * @apiGroup MEDIA FILES
 * @apiDescription Get user avatar image file
 * @apiParam (url param) {String} :username username of the user whose avatar file is to be fetched
 * @apiError (Error) {null} 404 if user or image is not found
 * @apiSuccess (Success) {png} 200 Use this url in img tag to auto display image
 *
 */
router.get('/users/:username/avatar', async (req, res) => {
  try {
    const user = await User.findOne({
      where: {
        username: req.params.username,
      },
    });

    if (!user) {
      throw new Error();
    }

    res.sendFile(`${publicPath}/${user.avatarPath}`);
  } catch (e) {
    res.sendStatus(404);
  }
});

/**
 * @api {GET} /media/posts/:postId/images Get image of a post
 * @apiName image post
 * @apiGroup MEDIA FILES
 * @apiDescription it will return the any images assciated with the post
 * @apiUse AuthUser
 * @apiParam (url param) {String} :postId postId of post whose images are to be fetched
 * @apiUse serverError
 * @apiSuccess (Success) {png} 200 a image associated with given post id
 *
 */
// Get /media/posts/:id/images
router.get('/media/posts/:postId/images', optionalAuth, async (req, res) => {
  try {
    const postR = await sequelize.query(
      `SELECT posts."mediaPath", posts."username", 
      users."private" FROM posts INNER JOIN users ON 
      users."username" = posts."username" WHERE posts."postId" = :postId`,
      {
        replacements: { postId: req.params.postId },
        raw: true,
      },
    );

    const post = postR[0][0];
    if (post.mediaPath === undefined) {
      throw new Error('No image in this post');
    }

    if (post.private === true) {
      if (req.user === undefined) {
        return res.status(401).send({ error: 'Please authenticate' });
      }

      const allowed = await Friend.findOne({
        where: {
          username: req.user.username,
          followed_username: post.username,
        },
        raw: true,
      });

      if (!allowed) {
        return res.status(401).send({ error: 'Please authenticate' });
      }
    }

    const imagePath = `${postImgPath}/${post.mediaPath}`;

    res.sendFile(imagePath);
  } catch (e) {
    res.sendStatus(500);
  }
});

/**
 * @api {GET} /media/posts/:postId/thumbnail Get thumbnails
 * @apiName get thumbnails
 * @apiGroup MEDIA FILES
 * @apiDescription Get thumbnails of a post if exists.
 * Usefull for placeholder while original image is loaded.
 * Max size of this files is 25kb
 *
 * @apiParam (url param) {String} :postId postId of the post whose thumbnail id to be fetched
 *
 * @apiSuccess (Success) {jpeg} 200 Image thumbnail file
 *
 * @apiUse serverError
 */
router.get('/media/posts/:postId/thumbnail', async (req, res) => {
  try {
    const post = await Post.findOne({
      where: {
        postId: req.params.postId,
      },
    });

    if (!post) {
      throw new Error('No such post exists');
    }

    if (videoMp4Pattern.test(post.mediaPath)) {
      const path = `${videoThumbnailPath}/${post.mediaPath}.jpeg`;
      return res.sendFile(path);
    }

    res.sendFile(`${imgThumbnailPath}/${post.mediaPath}`);
  } catch (e) {
    res.status(500).send();
  }
});

/**
 * @api {GET} /media/posts/:postId/video Get video of a post
 * @apiName post video
 * @apiGroup MEDIA FILES
 * @apiDescription Get video associated with post if any.
 * @apiUse AuthUser
 * @apiParam (url param) {String} :postId postId of the post whose video is to be fetched
 *
 * @apiUse serverError
 * @apiSuccess (Success) {video} 200 video of the post
 * @apiSuccess (Success) {stream} 206 returns the chunk of requested video.
 * Only applicable when <i>Content-Range</i> header is present.
 *
 * @apiHeader (Headers) {String} [Content-Range] usefull for streaming video instead of
 * downloading full video
 *
 */
router.get('/media/posts/:postId/video', optionalAuth, async (req, res) => {
  try {
    const postR = await sequelize.query(
      `SELECT posts."mediaPath", posts."username", 
      users."private" FROM posts INNER JOIN users ON 
      users."username" = posts."username" WHERE posts."postId" = :postId`,
      {
        replacements: { postId: req.params.postId },
        raw: true,
      },
    );

    const post = postR[0][0];

    if (!videoMp4Pattern.test(post.mediaPath)) {
      throw new Error('No video associated');
    }

    if (post.private === true) {
      if (req.user === undefined) {
        return res.status(401).send({ error: 'Please authenticate' });
      }

      const allowed = await Friend.findOne({
        where: {
          username: req.user.username,
          followed_username: post.username,
        },
        raw: true,
      });

      if (!allowed) {
        return res.status(401).send({ error: 'Please authenticate' });
      }
    }

    const path = `${videoPath}/${post.mediaPath}`;
    const stat = fs.statSync(path);
    const fileSize = stat.size;
    const { range } = req.headers;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      const chunkSize = end - start + 1;
      const file = fs.createReadStream(path, { start, end });

      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(200, head);
      fs.createReadStream(path).pipe(res);
    }
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
