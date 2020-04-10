const {DataTypes, Model} = require('sequelize');
const sequelize = require('../db');
const validator = require('validator');

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

        return result[0].map(post => {
            post.title = validator.unescape(post.title);
            post.description = validator.unescape(post.description);

            return post;
        });
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
                query = `WITH cte_posts AS (
                    SELECT posts.* FROM posts
                    INNER JOIN 
                    (SELECT * FROM friends WHERE 
                    friends."username"=:username) AS
                    followings ON
                    followings."followed_username" = posts."username"
                    UNION
                    SELECT posts.* FROM posts WHERE
                    posts."username"=:username
                    ORDER BY "createdAt" DESC OFFSET :skip LIMIT :limit
                )
                SELECT * FROM (SELECT likes."postId" FROM likes
                        WHERE "likedBy"=:username) 
                        AS sub1 INNER JOIN cte_posts
                        ON sub1."postId" = cte_posts."postId"`;
                break;
        }

        const result = await sequelize.query(query, {
            replacements: {username, skip, limit},
            raw: true,
        })

        return result[0].map(i => i.postId);
    }

    /**
     * Get ids of likes based on posts of single user
     * 
     * @param {String} username username whose posts are to be fetched 
     * @param {String} requester username of requester
     * @param {number} [skip] skips when end has reached
     * @param {number} [limit] ids to be returned on each call
     * 
     * @returns {Array} array of ids of like
     */
    static async getUserLikeId(username, requester, skip = 0, limit = 20) {
        const query = `SELECT sub1."postId" FROM 
            (SELECT posts.* FROM posts WHERE username=:username
            ORDER BY posts."createdAt" 
            DESC OFFSET :skip LIMIT :limit)
            AS sub1 INNER JOIN 
            (SELECT * FROM likes WHERE "likedBy"=:requester)
            AS sub2
            ON sub2."postId" = sub1."postId"`;

        const result = await sequelize.query(query, {
            replacements: {username, requester, skip, limit},
            raw: true,
        })

        return result[0].map(i => i.postId);
    }

    /**
     * Get users who liked post
     * 
     * @param {String} postId id of the post whose 
     * @param {number} [skip] skips when end is reached
     * @param {number} [limit] no. of entries to be returned on each call
     * 
     * @returns {Array} array of users who liked post 
     */
    static async getStarGazers(postId, skip = 0, limit = 20) {
        const query = `SELECT likes."likedBy" AS "username", users."avatarPath", users."name" FROM
            likes INNER JOIN users ON likes."likedBy" = users."username"
            WHERE likes."postId" = :postId ORDER BY likes."createdAt" DESC 
            OFFSET :skip LIMIT :limit`;

        const result = await sequelize.query(query, {
            replacements: {postId, skip, limit},
            raw: true,
        })

        return result[0];
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
            is: {
                args: "^[a-zA-Z0-9]+$",
                msg: 'Invalid username'
            }
        }
    },
    postedBy: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [4, 25],
            is: {
                args: "^[a-zA-Z0-9]+$",
                msg: 'Invalid username'
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