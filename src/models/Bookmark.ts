import { Model, DataTypes, Op } from 'sequelize';
import { sequelize } from '../db';
import { usernamePattern } from '../utils/regexPatterns';

interface BookMarkAttr {
  postId: string;
  username: string;
}

/**
 * Class for bookmark table
 * @class Bookmark
 */
class Bookmark extends Model implements BookMarkAttr {
  public postId!: string;

  public username!: string;

  public readonly createdAt!: Date;

  public readonly updatedAt!: Date;

  /**
     * returns the bookmarks of a specified user.
     *
     * @param {String} username user to whom bookmarks belong
     * @param {number} [skip] skips after end reached in frontend
     * @param {number} [limit] no. of post to be returned on each call
     *
     * @return {Array} array of bookmarks
     */
  static async getUserBookmarks(username: string, skip = 0, limit = 20) {
    const query = `WITH cte_books AS (
            SELECT posts."id", posts."postId", posts."username", posts."title",
            posts."description", posts."mediaIncluded",
            posts."likes", posts."comments", posts."createdAt" FROM posts
            INNER JOIN bookmarks
            ON posts."postId" = bookmarks."postId"
            WHERE bookmarks."username"=:username
            ORDER BY bookmarks."createdAt"
            OFFSET :skip LIMIT :limit
        )
        SELECT users."avatarPath", users."name", cte_books.* FROM users
        INNER JOIN cte_books
        ON cte_books."username" = users."username"`;

    const result = await sequelize.query(query,
      {
        replacements: { username, skip, limit },
        raw: true,
      });

    return result[0];
  }

  /**
     * Get ids of the bookmarks of specified user.
     *
     * @param {Array} postId array of ids to be intersected with bookmark table
     * @param {String} username username of user bookmarked
     *
     * @return {Array} array of bookmarks limited wrt to posts
     */
  static async getUserBookmarksIds(postId: string[], username: string): Promise<string[]> {
    const results = await Bookmark.findAll({
      where: {
        postId: {
          [Op.in]: postId,
        },
        username,
      },
      attributes: ['postId'],
    });

    return results.map((j: { postId: string; }): string => j.postId);
  }

  /**
     * Add a bookmark post if not present to bookmarks table else remove it
     *
     * @param {String} username username of the user who requested add
     * @param {String} postId post id to be added to bookmark
     *
     * @return {Boolean} whether bookmark is created or not
     */
  static async addBookmark(username: string, postId: string): Promise<Boolean> {
    const bookmarks = await Bookmark.count({
      where: {
        username,
        postId,
      },
    });

    if (bookmarks === 0) {
      Bookmark.create({ postId, username });
    } else {
      Bookmark.destroy({
        where: {
          username,
          postId,
        },
      });
    }

    return bookmarks === 0;
  }
}

Bookmark.init({
  postId: {
    type: DataTypes.STRING,
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
}, {
  sequelize,
  timestamps: true,
  modelName: 'bookmarks',
  freezeTableName: true,
});

export { BookMarkAttr, Bookmark };
