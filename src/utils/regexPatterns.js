const hashTagPattern = /\B(\#[a-zA-Z0-9]+\b)(?!;)/gm;
const handlePattern = /\B(\@[a-zA-Z0-9_.]+\b)(?!;)/gm;
const usernamePattern = /^[A-Za-z]+[A-Za-z0-9_.]+$/;

module.exports = {hashTagPattern, handlePattern, usernamePattern};
