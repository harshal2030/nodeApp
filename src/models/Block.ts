/* eslint-disable no-unused-vars */
import { Model, DataTypes, Op } from 'sequelize';
import fs from 'fs';

import { sequelize } from '../db';
import { Friend } from './Friend';

import { usernamePattern, videoMp4Pattern } from '../utils/regexPatterns';
import { mediaPath } from '../utils/paths';

interface BlockAttr {
  blocked: string;
  blockedBy: string;
};

/**
 * Class for blocked account
 * @class Block
 */
class Block extends Model implements BlockAttr {
  public blocked!: string;
  public blockedBy!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  async performBlock() {
    const block = this;
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

    const out = paths[0] as unknown as Array<{ mediaPath: string; }>;

    out.forEach((path) => {
      const filePath = mediaPath + path.mediaPath;

      fs.unlink(filePath, (err) => undefined);
      if (videoMp4Pattern.test(filePath)) {
        const thumbPath = `${mediaPath}/videos/thumbnails/${filePath.slice(8)}.webp`;
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

export { BlockAttr, Block };
