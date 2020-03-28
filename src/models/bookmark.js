const {Model, DataTypes} = require('sequelize');
const sequelize = require('../db')
const Post = require('./post');

/**Object for bookmarked posts 
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
     * @returns {Array} array of bookmarks 
     */
    static async getUserBookmarks(username, skip=0, limit=20) {

        const query = `WITH cte_books AS (
            SELECT posts.* FROM posts
            INNER JOIN bookmarks
            ON posts."postId" = bookmarks."postId"
            WHERE bookmarks."username"=:username
            ORDER BY bookmarks."createdAt"
            OFFSET :skip LIMIT :limit
        )
        SELECT users."avatarPath", cte_books.* FROM users
        INNER JOIN cte_books
        ON cte_books."username" = users."username"`
        

        const result = await sequelize.query(query,
                {
                    replacements: {username, skip, limit},
                    raw: true
                }
            )

            return result[0]
    }

    /**
     * Get ids of the bookmarks of specified user. 
     * 
     * @param {String} username username of user requested
     * @param {number} [skip] skips after end reached in frontend 
     * @param {limit} [limit] no. of bookmarks returned on each call
     * 
     * @returns {Array} array of bookmarks limited wrt to posts
     */
    static async getUserBookmarksIds(username, skip=0, limit=20) {
        const query = `SELECT sub1."postId" FROM
                        (SELECT posts.* FROM posts ORDER BY posts."createdAt" 
                        DESC OFFSET :skip LIMIT :limit)
                        AS sub1 INNER JOIN 
                        (SELECT * FROM bookmarks WHERE username=:username)
                        AS sub2
                        ON sub2."postId" = sub1."postId"
                        AND sub2."postDate"=sub1."createdAt"`;

        const results = await sequelize.query(query, {
            replacements: {username, skip, limit},
            raw: true
        })

        return results[0].map(j => j.postId)
    }

    /**
     * Add a bookmark post if not present to bookmarks table else remove it
     * 
     * @param {String} username username of the user who requested add 
     * @param {String} postId post id to be added to bookmark
     * 
     * @returns {Boolean} whether bookmark is created or not
     */
    static async addBookmark(username, postId) {
        const bookmarks = await Bookmark.count({
            where: {
                username,
                postId
            }
        })

        if (bookmarks === 0) {
            const postDate = await Post.findOne({
                where: {
                    postId
                },
                attributes: ['createdAt'],
                raw: true
            })
            Bookmark.create({postId, username, postDate: postDate.createdAt});
        } else {
            Bookmark.destroy({
                where: {
                    username,
                    postId
                }
            })
        }

        return bookmarks === 0 ? true : false;
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
            len: [4, 25],
            not: {
                args: /\s/,
                msg: 'Invalid username pattern'
            }
        }
    },
    postDate: {
        type: DataTypes.DATE,
        allowNull: false,
    }
}, {
    sequelize,
    timestamps: true,
    modelName: 'bookmarks',
    freezeTableName: true
})

const func = async () => {
    await Bookmark.sync({alter: true})
}

//func()

module.exports = Bookmark