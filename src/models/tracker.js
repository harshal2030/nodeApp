const { DataTypes, Model } = require('sequelize');
const sequelize = require('../db');
const { usernamePattern } = require('../utils/regexPatterns');

class Tracker extends Model {}

Tracker.init({
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 26],
      is: {
        args: usernamePattern,
        msg: 'Invalid username',
      },
    },
  },
  token: {
    type: DataTypes.STRING(2048),
    allowNull: false,
    unique: true,
  },
  os: {
    type: DataTypes.STRING,
  },
  osVersion: {
    type: DataTypes.STRING,
  },
  deviceBrand: {
    type: DataTypes.STRING,
  },
  buildNumber: {
    type: DataTypes.STRING,
  },
  fontScale: {
    type: DataTypes.STRING,
  },
  notificationToken: {
    type: DataTypes.STRING,
  },
  uniqueId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
}, {
  sequelize,
  timestamps: true,
  modelName: 'tracker',
  freezeTableName: true,
});

module.exports = Tracker;
