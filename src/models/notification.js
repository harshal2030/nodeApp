const { Model, DataTypes } = require('sequelize');
const sequelize = require('../db');
const { usernamePattern } = require('../utils/regexPatterns');

class Notification extends Model {}

Notification.init({
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
  action: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  reference: {
    type: DataTypes.STRING,
  },
  seen: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  sequelize,
  modelName: 'notifications',
  freezeTableName: true,
  timestamps: true,
});

const func = async () => {
  await Notification.sync();
};

func();

module.exports = Notification;
