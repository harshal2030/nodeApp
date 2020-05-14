const { Model, DataTypes } = require('sequelize');
const Sequelize = require('sequelize');
const sequelize = require('../db');
const User = require('./user');
const { usernamePattern } = require('../utils/regexPatterns');

/**
 * Class for blocked account
 * @class Block
 */
class Block extends Model {}

Block.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  blocked: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 26],
      is: {
        args: usernamePattern,
        msg: 'Invalid username',
      },
    },
    references: {
      model: User,
      key: 'username',
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
    },
  },
  blockedBy: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 26],
      is: {
        args: usernamePattern,
        msg: 'Invalid username',
      },
    },
    references: {
      model: User,
      key: 'username',
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
    },
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'block',
    validate: {
      isIn: [['block', 'mute']],
    },
  },
}, {
  validate: {
    checkUsers() {
      if (this.blocked === this.blockedBy) {
        throw new Error('Got indetical key pair');
      }
    },
  },
  sequelize,
  timestamps: true,
  modelName: 'blocks',
  freezeTableName: true,
});

const func = async () => {
  Block.sync({ alter: true });
};

// func();

module.exports = Block;
