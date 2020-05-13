/* eslint-disable no-useless-escape */
const hashTagPattern = /\B(\#[a-zA-Z0-9]+\b)(?!;)/gm;
const handlePattern = /\B(\@[a-zA-Z0-9_.]+\b)(?!;)/gm;
const usernamePattern = /^[A-Za-z]+[A-Za-z0-9_.]+$/;

const videoMp4Pattern = /\.(mp4)$/;

const httpChecker = new RegExp('^(http|https)://', 'i');
const urlPattern = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/mg;

module.exports = {
  hashTagPattern, handlePattern, usernamePattern, videoMp4Pattern, httpChecker, urlPattern,
};
