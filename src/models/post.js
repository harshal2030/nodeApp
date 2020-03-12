const {Model, DataTypes} = require('sequelize');
const sequelize = require('../db')
const Like = require('./like')
const Comment = require('./comment')
const uuidv4 = require('uuid/v4');
/**
 * Inatiates the Post model for the app
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
}

Post.init({
    postId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        defaultValue: uuidv4()
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
        validate: {
            max: 25
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
    }
}, {
    sequelize,
    timestamps: true,
    modelName: 'posts',
    freezeTableName: true
})

module.exports = Post;