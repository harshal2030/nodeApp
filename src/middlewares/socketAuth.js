/* eslint-disable no-param-reassign */
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const User = require('../models/user');

const publicKeyPath = path.join(__dirname, './../keys/public.key');
const publicKey = fs.readFileSync(publicKeyPath);

const auth = async (socket, next) => {
  try {
    const { token } = socket.handshake.query;
    const decoded = jwt.verify(token, publicKey, { algorithms: 'RS256' });

    const user = await User.findOne({
      where: {
        username: decoded.username,
        tokens: {
          [Op.contains]: [token],
        },
      },
    });

    if (!user) {
      throw new Error();
    }

    socket.user = user.toJSON();
    next();
  } catch (e) {
    next(new Error(e));
  }
};

module.exports = auth;
