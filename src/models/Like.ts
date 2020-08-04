/* eslint-disable no-param-reassign */
/* eslint-disable max-len */
import { DataTypes, Model, Op } from 'sequelize';
import { sequelize } from '../db';
import { usernamePattern } from '../utils/regexPatterns';

interface LikeAttr {
  postId: string;
  likedBy: string;
}

/**
 * Class for likes table
 * @class Like
 */
class Like extends Model implements LikeAttr {
  public postId!: string;

  public likedBy!: string;

  /**
   * Function to get posts liked by user
   *
   * @param {String} username username of the user
   * @param {number} [skip] skips after end reached
   * @param {number} [limit] no. of posts to be returned on each call
   *
   * @return {Array} array of posts liked by user
   */
  static async getUserLikes(username: string, skip = 0, limit = 20) {
    const query = `WITH cte_likes AS (
            SELECT posts."postId", posts."username", posts."title", posts."id", 
            posts."description", posts."mediaIncluded", posts."mediaPath",
            posts."likes", posts."comments", posts."createdAt" FROM likes 
            INNER JOIN posts ON posts."postId" = likes."postId"
            WHERE likes."likedBy" = :username
            OFFSET :skip LIMIT :limit
        )
        SELECT users."avatarPath", users."name", cte_likes.* FROM users INNER JOIN cte_likes ON
        cte_likes."username" = users."username"`;

    const result = await sequelize.query(query, {
      replacements: { username, skip, limit },
      raw: true,
    });

    return result[0];
  }

  /**
   * Intersect array of given id with like id
   *
   * @param {Array} postId ids of post to be searched in like table
   * @param {String} username username of user who liked
   * @return {Array} array of postIds liked by user
   */
  static async getUserLikeIds(postId: string[], username: string): Promise<string[]> {
    const result = await Like.findAll({
      where: {
        postId: {
          [Op.in]: postId,
        },
        likedBy: username,
      },
      attributes: ['postId'],
    });

    return result.map((i: { postId: string; }): string => i.postId);
  }

  /**
   * Get users who liked post
   *
   * @param {String} postId id of the post whose
   * @param {number} [skip] skips when end is reached
   * @param {number} [limit] no. of entries to be returned on each call
   *
   * @return {Array} array of users who liked post
   */
  static async getStarGazers(postId: string, skip = 0, limit = 20) {
    const query = `SELECT likes."likedBy" AS "username", users."avatarPath", users."name", users."id" 
            FROM likes INNER JOIN users ON likes."likedBy" = users."username"
            WHERE likes."postId" = :postId
            OFFSET :skip LIMIT :limit`;

    const result = await sequelize.query(query, {
      replacements: { postId, skip, limit },
      raw: true,
    });

    return result[0];
  }
}

Like.init(
  {
    postId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    likedBy: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [4, 25],
        is: {
          args: usernamePattern,
          msg: 'Invalid username',
        },
      },
    },
  },
  {
    sequelize,
    timestamps: true,
    modelName: 'likes',
    freezeTableName: true,
  },
);

export { LikeAttr, Like };
