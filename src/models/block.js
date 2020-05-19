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

    const paths = await sequelize.query(`WITH cte_comments AS (
      DELETE FROM posts WHERE username=:blocked
        AND "parentId" IN (SELECT "postId" FROM posts WHERE username=:blockedBy) 
      RETURNING "parentId", "mediaPath"
    ), cte_filters AS (
      SELECT count("parentId") cc, 
      "parentId", "mediaPath" FROM cte_comments GROUP BY "parentId", "mediaPath"
    )
    UPDATE posts SET "comments" = "comments" - cte_filters."cc"
    FROM cte_filters WHERE posts."postId" = cte_filters."parentId"
    RETURNING cte_filters."mediaPath"`, {
      replacements: { blocked, blockedBy },
      raw: true,
    });

    console.log(paths);
    console.log(paths[0]);

    paths[0].forEach((path) => {
      const filePath = mediaPath + path.mediaPath;

      fs.unlink(filePath, (err) => console.log(err));
      if (videoMp4Pattern.test(filePath)) {
        const thumbPath = `${mediaPath}/videos/thumbnails/${path.slice(8)}.webp`;
        fs.unlink(thumbPath, (err) => console.log(err));
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
  timestamps: true,
  modelName: 'blocks',
  freezeTableName: true,
});

module.exports = Block;
