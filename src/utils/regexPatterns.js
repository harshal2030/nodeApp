const hashTagPattern = /#([A-Za-z0-9]+[A-Za-z0-9-_.]*)/gm;
const handlePattern = /@([A-Za-z]+[A-Za-z0-9_.]+)/gm;
const usernamePattern = /^[A-Za-z]+[A-Za-z0-9_.]+$/;

module.exports = {hashTagPattern, handlePattern, usernamePattern};
