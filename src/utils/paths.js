const path = require('path');

// public paths
const publicPath = path.join(__dirname, '../../public');
const avatarPath = path.join(__dirname, '../../public/images/avatar');
const headerPath = path.join(__dirname, '../../public/images/header');

// media paths
const postImgPath = path.join(__dirname, '../../media/images/posts');
const commentImgPath = path.join(__dirname, '../../media/images/comments');
const videoPath = path.join(__dirname, '../../media/videos');
const mediaPath = path.join(__dirname, './../../media');
const thumbnailPath = path.join(__dirname, '../../media/videos/thumbnails');

module.exports = {
  publicPath,
  postImgPath,
  commentImgPath,
  videoPath,
  avatarPath,
  headerPath,
  mediaPath,
  thumbnailPath,
};
