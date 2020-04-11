const {Model, DataTypes, QueryTypes} = require('sequelize');
const sequelize = require('../db')
const Like = require('./like')

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
     * @param {Object} commentBody body of the comment
     * @returns {number} number of comments
     */
    static async comment(commentBody) {
        const {type, replyTo} = commentBody;
        if (type !== 'reply' || replyTo === '') {
            throw new Error('Not a valid type comment')
        }
        await Post.create(commentBody);
        Post.increment({comments: 1}, {where: {postId: replyTo}});

        return await Post.count({where: {replyTo: replyTo}})
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
            SELECT posts."postId", posts."username", posts."title",
			posts."description", posts."mediaIncluded", posts."mediaPath",
			posts."likes", posts."comments", posts."createdAt"
			FROM posts
            INNER JOIN friends ON
            friends."followed_username" = posts."username" WHERE 
			posts."type"='post' AND friends."username" = :username
            UNION ALL
            SELECT posts."postId", posts."username", posts."title",
			posts."description", posts."mediaIncluded", posts."mediaPath",
			posts."likes", posts."comments", posts."createdAt" 
			FROM posts WHERE
            posts."username"=:username AND posts."type" = 'post'
            ORDER BY "createdAt" DESC OFFSET :skip LIMIT :limit
        )
        SELECT users."avatarPath", users."name", cte_posts.* FROM users
        INNER JOIN cte_posts ON
        cte_posts."username" = users."username"`;

        const result = await sequelize.query(query, {
            replacements: {username, skip, limit},
            raw: QueryTypes.SELECT
        })

        return result[0];
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

        return result[0];
    }
}

Post.init({
    postId: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [1, 26],
            is: {
                args: "^[a-zA-Z0-9_]+$",
                msg: 'Invalid username'
            }
        }
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'post',
    },
    sharable: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    title: {
        type: DataTypes.STRING(60),
        allowNull: true,
        defaultValue: '',
        validate: {
            min: 1,
        }
    },
    replyTo: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    description: {
        type: DataTypes.STRING(2048),
        allowNull: true,
        defaultValue: '',
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
        allowNull: true,
    },
    likes: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    comments: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    }
}, {
    sequelize,
    timestamps: true,
    modelName: 'posts',
    freezeTableName: true,
})

const func = async () => {
    Post.sync({force: true})
}
//func()

module.exports = Post;