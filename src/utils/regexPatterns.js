const hashTagPattern = /(?:^|\s)(?:#)([a-zA-Z\d._]+)/;
const handlePattern = /@([A-Za-z]+[A-Za-z0-9_.]+)/gm;
const usernamePattern = /^[A-Za-z]+[A-Za-z0-9_.]+$/;

module.exports = {hashTagPattern, handlePattern, usernamePattern};
