const {Model, DataTypes} = require('sequelize');
const sequelize = require('../db')
const Like = require('./like')
const Comment = require('./comment')
const Bookmark = require('./bookmark')
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
    * @returns {undefined}  
    */
    static async like(postId, likedBy, postedBy) {
        Like.create({postId, likedBy, postedBy});
        Post.increment({likes: 1}, {where: {postId}});
    }

    /**
     * -Updates the comment table
     * -Increment the comments in post table
     * 
     * @param {String} postId uuidv4 of the post
     * @param {String} commentBy author of the comment
     * @param {String} commentValue body of the comment
     * @param {String} postedBy author of the post
     * @returns {undefined}
     */
    static async comment(postId, commentBy, commentValue, postedBy) {
        Comment.create({postId, commentBy, commentValue, postedBy});
        Post.increment({comments: 1}, {where: {postId}});
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
        const posts = await Post.findAll({
            where: {
                username
            },
            order: [
                ['createdAt', 'DESC']
            ],
            offset: skip,
            limit
        })

        return posts
    }

    /**
     * Function that fetch miscs from database for specified user
     * 
     * @param {String} username miscs belonging to user
     * @param {String} [option] misc options to be performed, example get all bookmarks
     * 
     * @returns {Array} bookmarks of a user else null 
     */
    static async getUserMiscs(username, option = 'bookmark') {
        let out;
        if (option === 'bookmark') {
            out = Bookmark.findAll({
                where: {
                    username
                }
            })
        }

        return out;
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
            len: [4, 25],
            not: {
                args: /\s/,
                msg: 'Invalid username pattern'
            }
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [4, 50]
        }
    },
    postedFor: {
        type: DataTypes.STRING,
        defaultValue: 'REPLACE>THIS',
    },
    title: {
        type: DataTypes.STRING,
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
    }
}, {
    sequelize,
    timestamps: true,
    modelName: 'posts',
    freezeTableName: true
})

module.exports = Post;