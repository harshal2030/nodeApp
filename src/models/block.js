/* eslint-disable no-unused-vars */
const { Model, DataTypes, Op } = require('sequelize');
const Sequelize = require('sequelize');
const fs = require('fs');

const sequelize = require('../db');

const Friend = require('./friend');

const { usernamePattern, videoMp4Pattern } = require('../utils/regexPatterns');
const { mediaPath } = require('../utils/paths');
/**
 * Class for blocked account
 * @class Block
 */
class Block extends Model {
  async performBlock() {
    const block = this.toJSON();
    const { blocked, blockedBy } = block;

    Friend.destroy({
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

    const paths = await sequelize.query(`WITH rawInfo AS (
      SELECT "parentId", count("parentId") cc FROM posts WHERE username=:blocked
      AND "parentId" IN (SELECT "postId" FROM posts WHERE username=:blockedBy)
      GROUP BY "parentId"
    ), updateCommand AS (
      UPDATE posts SET "comments" = "comments" - rawInfo."cc" FROM rawInfo
      WHERE posts."postId" = rawInfo."parentId"
    )
    DELETE FROM posts USING rawInfo WHERE rawInfo."parentId" = posts."parentId" 
    RETURNING "mediaPath"`, {
      replacements: { blocked, blockedBy },
      raw: true,
    });

    paths[0].forEach((path) => {
      const filePath = mediaPath + path.mediaPath;

      fs.unlink(filePath, (err) => undefined);
      if (videoMp4Pattern.test(filePath)) {
        const thumbPath = `${mediaPath}/videos/thumbnails/${path.slice(8)}.webp`;
        fs.unlink(thumbPath, (err) => undefined);
      }
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
  timestamps: false,
  modelName: 'blocks',
  freezeTableName: true,
});

module.exports = Block;
