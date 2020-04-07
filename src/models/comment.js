const {Model, DataTypes} = require('sequelize');
const sequelize = require('../db')

class Comment extends Model {
    /*
    * Insert the comment in table for any post
    * Model for comments table
    */
}

Comment.init({
    postId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    commentBy: {
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
    commentValue: {
        type: DataTypes.STRING(1000),
        allowNull: false,
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
    postedBy: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [1, 26],
            is: {
                args: "^[a-zA-Z0-9]+$",
                msg: 'Invalid username'
            }
        }
    }
}, {
    sequelize,
    timestamps: true,
    modelName: 'comments',
    freezeTableName: true,
})

module.exports = Comment