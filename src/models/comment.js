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
            len: [4, 25],
            not: {
                args: /\s/,
                msg: 'Invalid username pattern'
            }
        }
    },
    commentValue: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            min: 1
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
    modelName: 'comments',
    freezeTableName: true,
})

module.exports = Comment