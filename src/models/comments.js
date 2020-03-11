const {Model, DataTypes} = require('sequelize');
const sequelize = require('./../db')

class Comment extends Model {}

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

const func = async () => {
    await Comment.sync()
}

module.exports = Comment