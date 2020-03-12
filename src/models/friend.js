const {DataTypes, Model} = require('sequelize');
const sequelize = require('../db')

class Friend extends Model {}

Friend.init({
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
    followed_username: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [4, 25],
            not: {
                args: /\s/,
                msg: "Invalid username pattern"
            }
        }
    },
    followed_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [4, 50]
        }
    }
}, {
    sequelize,
    timestamps: true,
    modelName: 'friends',
    freezeTableName: true,
})

module.exports = Friend;