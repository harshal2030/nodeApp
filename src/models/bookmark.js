const {Model, DataTypes} = require('sequelize');
const sequelize = require('../db')

/**Object for bookmarked posts 
 * @class Bookmark
*/
class Bookmark extends Model {}

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