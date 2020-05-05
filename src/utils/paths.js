const path = require('path');

const publicPath = path.join(__dirname, "../../public");
const postImgPath = path.join(__dirname, "../../public/images/posts");
const commentImgPath = path.join(__dirname, "../../public/images/comments");
const videoPath = path.join(__dirname, '../../public/videos');

module.exports = {publicPath, postImgPath, commentImgPath, videoPath};
