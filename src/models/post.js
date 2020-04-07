const {Model, DataTypes, QueryTypes} = require('sequelize');
const sequelize = require('../db')
const Like = require('./like')
const Comment = require('./comment')
const validator = require('validator')

/**
 * Initiates the Post model for the app
 * @class Post 
 */
class Post extends Model {
    /**
    * Updates like table.
    * Increment the likes in post table
    * @param {String} postId uuidv4 of the post
    * @param {String} likedBy user who liked
    * @param {String} postedBy user who posted it
    * @returns {number} number of likes  
    */
    static async like(postId, likedBy, postedBy) {
        await Like.create({postId, likedBy, postedBy});
        Post.increment({likes: 1}, {where: {postId}});

        return await Like.count({where: {postId}})
    }

    /**
     * Updates the comment table
     * Increment the comments in post table
     * 
     * @param {String} postId uuidv4 of the post
     * @param {String} commentBy author of the comment
     * @param {String} commentValue body of the comment
     * @param {String} postedBy author of the post
     * @returns {number} number of comments
     */
    static async comment(postId, commentBy, commentValue, postedBy) {
        Comment.create({postId, commentBy, commentValue, postedBy});
        Post.increment({comments: 1}, {where: {postId}});

        return await Comment.count({where: {postId}})
    }

    /**
    * Get the feed for a user.
    * @param {String} username username of the user 
    * @param {number} [skip] skips after end reached in frontend
    * @param {number} [limit] no. of post to be returned on each call
    * 
    * @returns {Array} array of posts for user feed
    */
    static async getUserFeed(username, skip = 0, limit = 20) {
        const query = `WITH cte_posts AS (
            SELECT posts.* FROM posts
            INNER JOIN 
			(SELECT * FROM friends WHERE friends."username"=:username) AS
			followings ON
            followings."followed_username" = posts."username"
            UNION
            SELECT posts.* FROM posts WHERE
            posts."username"=:username
        )
        SELECT users."avatarPath", users."name", cte_posts.* FROM users
        INNER JOIN cte_posts ON
        cte_posts."username" = users."username"
        ORDER BY cte_posts."createdAt" DESC OFFSET :skip LIMIT :limit`;

        const result = await sequelize.query(query, {
            replacements: {username, skip, limit},
            raw: QueryTypes.SELECT
        })

        return result[0].map(post => {
            post.title = validator.unescape(post.title);
            post.description = validator.unescape(post.description);

            return post;
        });
    }

    /**
     * Get posts of a user 
     * 
     * @param {String} username username of user
     * @param {number} [skip] skips after end is reached
     * @param {number} [limit] no. of posts to returned on each call
     * 
     * @returns {Array} array of posts of auser 
     */
    static async getUserPosts(username, skip=0, limit=10) {
        const query = `SELECT users."avatarPath", users."name", foo.* FROM 
            (SELECT * FROM posts WHERE posts."username"=:username)
            AS foo
            INNER JOIN users ON
            users."username" = foo."username" 
            ORDER BY foo."createdAt" DESC OFFSET :skip LIMIT :limit`;

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
}

Post.init({
    postId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        defaultValue: DataTypes.UUIDV4
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [1, 26],
            is: {
                args: "^[a-zA-Z0-9]+$",
                msg: 'Invalid username'
            }
        }
    },
    postedFor: {
        type: DataTypes.STRING,
        defaultValue: 'REPLACE>THIS',
    },
    title: {
        type: DataTypes.STRING,
        validate: {
            min: 1,
        }
    },
    description: {
        type: DataTypes.STRING,
        validate: {
            min: 1
        }
    },
    mediaIncluded: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    mediaPath: {
        type: DataTypes.STRING,
    },
    likes: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    comments: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
}, {
    sequelize,
    timestamps: true,
    modelName: 'posts',
    freezeTableName: true,
    hooks: {
        beforeSave: (post, options) => {
            post.title = validator.escape(post.title);
            post.description = validator.escape(post.description);
        }
    }
})

const func = async () => {
    Post.sync({alter: true})
}
//func()

module.exports = Post;