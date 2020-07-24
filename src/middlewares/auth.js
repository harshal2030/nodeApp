/* eslint-disable no-throw-literal */
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User } = require('../models/User')

const publicKeyPath = path.join(__dirname, '../keys/public.key');
const publicKey = fs.readFileSync(publicKeyPath, 'utf-8');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
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

    req.token = token;
    req.user = user;
    next();
  } catch (e) {
    res.status(401).send({ error: 'Please authenticate' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const isToken = req.header('Authorization');

    if (isToken === undefined) {
      throw 'no token';
    }

    const token = req.header('Authorization').replace('Bearer ', '');
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
      throw 'no such user';
    }

    req.token = token;
    req.user = user.toJSON();
    next();
  } catch (e) {
    if (e === 'no such user') {
      res.status(401).send();
    } else if (e === 'no token') {
      req.user = undefined;
      next();
    }
  }
};

module.exports = { auth, optionalAuth };
