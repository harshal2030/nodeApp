const { Model, DataTypes, Op } = require('sequelize');
const sequelize = require('../db');
const { usernamePattern } = require('../utils/regexPatterns');

/**
 * Class for bookmark table
 * @class Bookmark
 */
class Bookmark extends Model {
  /**
     * returns the bookmarks of a specified user.
     *
     * @param {String} username user to whom bookmarks belong
     * @param {number} [skip] skips after end reached in frontend
     * @param {number} [limit] no. of post to be returned on each call
     *
     * @return {Array} array of bookmarks
     */
  static async getUserBookmarks(username, skip = 0, limit = 20) {
    const query = `WITH cte_books AS (
            SELECT posts.* FROM posts
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
  static async getUserBookmarksIds(postId, username) {
    const results = await Bookmark.findAll({
      where: {
        postId: {
          [Op.in]: postId,
        },
        username,
      },
      attributes: ['postId'],
    });

    return results.map((j) => j.postId);
  }

  /**
     * Add a bookmark post if not present to bookmarks table else remove it
     *
     * @param {String} username username of the user who requested add
     * @param {String} postId post id to be added to bookmark
     *
     * @return {Boolean} whether bookmark is created or not
     */
  static async addBookmark(username, postId) {
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

module.exports = Bookmark;
