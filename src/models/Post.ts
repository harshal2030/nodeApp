/* eslint-disable no-unused-vars */
/* eslint-disable no-return-await */
/* eslint-disable new-cap */
/* eslint-disable max-len */
/* eslint-disable no-tabs */
import { Model, DataTypes, Op } from 'sequelize';
import fs from 'fs';
import { nanoid } from 'nanoid';

import { sequelize } from '../db';
import { Like } from './Like';
import { Tag } from './Tag';

import { usernamePattern, videoMp4Pattern } from '../utils/regexPatterns';
import { mediaPath } from '../utils/paths';

interface PostAttr {
  id: number;
  postId: string;
  username: string;
  sharable: Boolean;
  replyTo: string | null;
  parentId: string | null;
  title: string;
  description: string;
  mediaIncluded: string;
  mediaPath: string;
  likes: number;
  comments: number;
  tags: string[];
  mentions: string[];
  bookmarked?: Boolean;
  liked?: Boolean;
}

/**
 * Initiates the Post model for the app
 * @class Post
 */
class Post extends Model implements PostAttr {
  public id!: number;
  public postId!: string;
  public username!: string;
  public sharable!: Boolean;
  public replyTo!: string | null;
  public parentId!: string | null;
  public title!: string;
  public description!: string;
  public mediaIncluded!: string;
  public mediaPath!: string;
  public likes!: number;
  public comments!: number;
  public tags!: string[];
  public mentions!: string[];

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  /**
    * Updates like table.
    * Increment the likes in post table
    * @param {String} postId uuidv4 of the post
    * @param {String} likedBy user who liked
    * @return {number} number of likes
    */
  static async like(postId: string, likedBy: string): Promise<number> {
    await Like.create({ postId, likedBy });
    Post.increment({ likes: 1 }, { where: { postId } });

    return await Like.count({ where: { postId } });
  }

  /**
     * Updates the comment table
     * Increment the comments in post table
     *
     * @param {Object} commentBody body of the comment
     * @return {number} number of comments
     */
  static async comment(commentBody: PostAttr): Promise<number> {
    const { replyTo } = commentBody;
    if (replyTo === '' || replyTo === null) {
      throw new Error('Not a valid type comment');
    }
    await Post.create(commentBody);
    Post.increment({ comments: 1 }, { where: { postId: replyTo } });

    return await Post.count({ where: { replyTo } });
  }

  /**
    * Get the feed for a user.
    * @param {String} username username of the user
    * @param {number} [skip] skips after end reached in frontend
    * @param {number} [limit] no. of post to be returned on each call
    *
    * @return {Array} array of posts for user feed
    */
  static async getUserFeed(username: string, skip = 0, limit = 20) {
    const query = `WITH cte_posts AS (
        SELECT posts."id", posts."postId", posts."username", posts."title",
  posts."description", posts."mediaIncluded", posts."mediaPath",
  posts."likes", posts."comments", posts."createdAt"
  FROM posts
        INNER JOIN friends ON
        friends."followed_username" = posts."username" WHERE 
  posts."replyTo" IS NULL AND friends."username" = :username
        UNION ALL
        SELECT posts."id", posts."postId", posts."username", posts."title",
  posts."description", posts."mediaIncluded", posts."mediaPath", 
  posts."likes", posts."comments", posts."createdAt" 
  FROM posts WHERE
        posts."username"=:username AND posts."replyTo" IS NULL
        ORDER BY "createdAt" DESC OFFSET :skip LIMIT :limit
    )
    SELECT users."avatarPath", users."name", cte_posts.* FROM users
    INNER JOIN cte_posts ON
    cte_posts."username" = users."username" ORDER BY cte_posts."createdAt" DESC`;

    const result = await sequelize.query(query, {
      replacements: { username, skip, limit },
      raw: true,
    });

    return result[0];
  }
  /**
     * Get posts of a user
     *
     * @param {String} username username of user
     * @param {number} [skip] skips after end is reached
     * @param {number} [limit] no. of posts to returned on each call
     *
     * @return {Array} array of posts of auser
     */
  static async getUserPosts(username: string, skip = 0, limit = 10) {
    const query = `SELECT users."avatarPath", users."name", posts."postId", posts."username", 
            posts."title", posts."description", posts."mediaIncluded", posts."mediaPath",
            posts."likes", posts."comments", posts."createdAt", posts."id" FROM posts
            INNER JOIN users ON
            users."username" = posts."username" WHERE 
            posts."replyTo" IS NULL AND posts."username"=:username 
            ORDER BY posts."createdAt" DESC OFFSET :skip LIMIT :limit`;

    const result = await sequelize.query(query, {
      replacements: { username, skip, limit },
      raw: true,
    });

    return result[0];
  }

  /**
     * Get array of comments based on postId
     *
     * @param {String} postId id of post whose comments are to be fetched
     * @param {number} [skip] skips after end is reached
     * @param {number} [limit] no. of comments to be returned on each call
     *
     * @return {Array} array of comments
     */
  static async getComments(postId: string, skip = 0, limit = 10) {
    const query = `SELECT posts."postId", posts."username", posts."title", posts."id",
            posts."description", posts."mediaIncluded", posts."mediaPath",
            posts."likes", posts."comments",
            posts."createdAt", users."name", users."avatarPath" FROM posts INNER JOIN users ON
            users."username" = posts."username"
            WHERE posts."replyTo"=:postId OFFSET :skip LIMIT :limit`;

    const result = await sequelize.query(query, {
      replacements: { postId, skip, limit },
      raw: true,
    });

    return result[0];
  }

  /**
     * Alter array of posts and add additional info such as liked, bookmarked, video etc.
     *
     * @param {Array} posts Array of objects containing post Data
     * @param {Array} bookmarkIds Array of bookmark ids
     * @param {Array} likeIds Array of like ids
     *
     * @return {Array} altered array with additional info
     */
  static addUserInfo(posts: PostAttr[], bookmarkIds: string[], likeIds: string[]): PostAttr[] {
    const data = [];
    const ref = posts;

    if (posts.length < bookmarkIds.length || posts.length < likeIds.length) {
      throw new Error('Invalid data');
    }

    for (let i = 0; i < ref.length; i += 1) {
      if (bookmarkIds.includes(ref[i].postId)) {
        ref[i].bookmarked = true;
      } else {
        ref[i].bookmarked = false;
      }

      if (likeIds.includes(ref[i].postId)) {
        ref[i].liked = true;
      } else {
        ref[i].liked = false;
      }

      data.push(ref[i]);
    }

    return data;
  }

  /**
   * Deletes media of comment of a post
   * @returns {void}
   */
  async removeReplyMedia() {
    const { postId } = this;
    const rawPaths = await Post.findAll({
      where: {
        parentId: postId,
        mediaPath: {
          [Op.not]: null,
        },
      },
      attributes: ['mediaPath'],
      raw: true,
    }).map((path) => path.mediaPath);

    rawPaths.forEach((path) => {
      const filePath = mediaPath + path;

      fs.unlink(filePath, (err) => undefined);
      if (videoMp4Pattern.test(filePath)) {
        const thumbPath = `${mediaPath}/videos/thumbnails/${path.slice(8)}.webp`;
        fs.unlink(thumbPath, (err) => undefined);
      }
    });
  }
}

Post.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
  },
  postId: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => nanoid(),
    allowNull: false,
  },
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
  sharable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  replyTo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  parentId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  title: {
    type: DataTypes.STRING(60),
    allowNull: true,
    defaultValue: '',
    validate: {
      min: 1,
    },
  },
  description: {
    type: DataTypes.STRING(2048),
    allowNull: true,
    defaultValue: '',
    validate: {
      min: 1,
    },
  },
  mediaIncluded: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  mediaPath: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  comments: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING(150)),
    defaultValue: [],
  },
  mentions: {
    type: DataTypes.ARRAY(DataTypes.STRING(30)),
    defaultValue: [],
  },
}, {
  validate: {
    checkEmptyPost(this: PostAttr) {
      if (this.title.trim().length === 0
        && this.description.trim().length === 0
        && (this.mediaIncluded === undefined || this.mediaIncluded === null)) {
        throw new Error('Got an empty post');
      }
    },
  },
  sequelize,
  timestamps: true,
  modelName: 'posts',
  freezeTableName: true,
  hooks: {
    afterCreate: async (post, options) => {
      try {
        const { tags } = post;
        if (tags.length !== 0) {
          tags.forEach((tag) => {
            Tag.createUpdateTag(tag);
          });
        }
      } catch (e) {
        // do nothing
      }
    },
  },
});


export { Post, PostAttr };
