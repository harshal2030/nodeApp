const {DataTypes, Model} = require('sequelize');
const sequelize = require('../db');

class Like extends Model{

    /**
     * Function to get posts liked by user
     * 
     * @param {String} username username of the user 
     * @param {number} [skip] skips after end reached
     * @param {number} [limit] no. of posts to be returned on each call
     * 
     * @returns {Array} array of posts liked by user
     */
    static async getUserLikes(username, skip = 0, limit = 20) {
        const query = `WITH cte_likes AS (
            SELECT posts.* FROM (SELECT "postId" FROM likes WHERE
                        likes."likedBy" = :username
                        ORDER BY likes."createdAt" OFFSET :skip LIMIT :limit)
            AS user_likes INNER JOIN posts ON posts."postId" = user_likes."postId"
        )
        SELECT users."avatarPath", cte_likes.* FROM users INNER JOIN cte_likes ON
        cte_likes."username" = users."username"`

        const result = await sequelize.query(query, {
            replacements: {username, skip, limit},
            raw: true,
        })

        return result[0];
    }

    /**
     * Get array of ids of posts liked by user
     * 
     * @param {String} username username of the user
     * @param {String} mode bookmarks | posts Get ids accord to request type
     * @param {number} [skip] no. skips in posts
     * @param {number} [limit] limits in posts
     * 
     * @returns {Array} array of postIds liked by user
     */
    static async getUserLikeIds(username, mode, skip = 0, limit = 20) {
        let query;
        switch (mode) {
            case 'bookmarks':
                query = `SELECT likes.* FROM 
                (SELECT bookmarks."postId" FROM bookmarks WHERE 
                username=:username OFFSET :skip LIMIT :limit) AS books
                INNER JOIN
                (SELECT likes."postId"
                FROM likes WHERE "likedBy" = :username) AS likes
                ON likes."postId" = books."postId"`;
                break;
            default:
                query = `SELECT sub1."postId" FROM 
                (SELECT posts.* FROM posts ORDER BY posts."createdAt" 
                DESC OFFSET :skip LIMIT :limit)
                AS sub1 INNER JOIN 
                (SELECT * FROM likes WHERE "likedBy"=:username)
                AS sub2
                ON sub2."postId" = sub1."postId"`;
                break;
        }

        const result = await sequelize.query(query, {
            replacements: {username, skip, limit},
            raw: true,
        })

        return result[0].map(i => i.postId);
    }
}

Like.init({
    postId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    likedBy: {
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
    postedBy: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [4, 25],
            not: {
                args: /\s/,
                msg: 'Invalid username pattern'
            }
        }
    }
}, {
    sequelize,
    timestamps: true,
    modelName: 'likes',
    freezeTableName: true,
})

module.exports = Like