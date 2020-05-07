const {Model, DataTypes} = require('sequelize');
const sequelize = require('../db');
const {usernamePattern} = require('./../utils/regexPatterns');

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
  },
}, {
  sequelize,
  timestamps: true,
  modelName: 'blocks',
  freezeTableName: true,
});

const func = async () => {
  Block.sync();
};

func();

module.exports = Block;
