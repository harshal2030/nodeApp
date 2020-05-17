/* eslint-disable no-unused-vars */
const { Model, DataTypes, Op } = require('sequelize');
const Sequelize = require('sequelize');
const sequelize = require('../db');
const User = require('./user');
const { usernamePattern } = require('../utils/regexPatterns');
const Friend = require('./friend');
const Post = require('./post');
const Like = require('./like');

/**
 * Class for blocked account
 * @class Block
 */
class Block extends Model {
  async performBlock() {
    const block = this.toJSON();
    const { blocked, blockedBy } = block;

    await Friend.destroy({
      where: {
        username: {
          [Op.or]: [blocked, blockedBy],
        },
        followed_username: {
          [Op.or]: [blocked, blockedBy],
        },
      },
    });

    sequelize.query(`WITH cte_likes AS (
      DELETE FROM likes USING posts WHERE 
        likes."likedBy" = :blocked AND (likes."postId" = posts."postId" AND 
        posts."username" = :blockedBy) RETURNING likes."postId"
    )
    UPDATE posts SET likes = likes - 1 FROM 
    cte_likes WHERE cte_likes."postId" = posts."postId"`, {
      replacements: { blocked, blockedBy },
      raw: true,
    });
  }
}

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

module.exports = Block;
