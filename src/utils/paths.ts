import path from 'path';

// public paths
const publicPath = path.join(__dirname, '../../public');
const avatarPath = path.join(__dirname, '../../public/images/avatar');
const headerPath = path.join(__dirname, '../../public/images/header');

// media paths
const postImgPath = path.join(__dirname, '../../media/images/posts');
const videoPath = path.join(__dirname, '../../media/videos');
const mediaPath = path.join(__dirname, './../../media');
const videoThumbnailPath = path.join(__dirname, '../../media/videos/thumbnails');
const imgThumbnailPath = path.join(__dirname, '../../media/images/thumbnails');

export {
  publicPath,
  postImgPath,
  videoPath,
  avatarPath,
  headerPath,
  mediaPath,
  videoThumbnailPath,
  imgThumbnailPath,
};
