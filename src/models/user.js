const {Model, DataTypes} = require('sequelize');
const sequelize = require('./../db')
const validator = require('validator')
const jwt = require('jsonwebtoken');
const sha512 = require('crypto-js/sha512')
const fs = require('fs')
const path = require('path')

const keyPath = path.join(__dirname, '../keys/private.key')
const privateKey = fs.readFileSync(keyPath ,'utf-8');

class User extends Model {
    generateAuthToken() {
        const user = this;

        const token = jwt.sign({username: user.username.toString()}, privateKey, {algorithm: 'RS256'});
        user.tokens.push(token)
        user.save({fields: ['tokens']})
        return token;
    }

    removeSensetiveUserData() {
        const user = this.toJSON();

        return {
            name: user.name,
            username: user.username,
            adm_num: user.adm_num,
            dob: user.dob,
            createdAt: user.createdAt
        }
    }
}
/*
* This a user model that validates th use before inserting in to the database
* @param
*/
User.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [4, 50]
        }
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
            args: true,
            msg: 'Username already exists, try a different one.'
        },
        validate: {
            len: [4, 25],
            not: {
                args: /\s/,
                msg: 'Invalid username pattern'
            }
        }
    },
    adm_num: {
        type: DataTypes.STRING,
        validate: {
            len: [3, 10]
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
            args: true,
            msg: 'Email already exists, try loging in instead.'
        },
        validate: {
            isEmail: true
        }
    },
    dob: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },

    phone: {
        type: DataTypes.INTEGER,
        validate: {
            checkPhoneNumber(value) {
                if (!validator.isMobilePhoneNumber(value)) {
                    throw new Error("Phone number is not valid")
                }
            }
        }
    },
    avatarPath: {
        type: DataTypes.STRING,
        defaultValue: 'uploads/images/avatar/default.png'
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            min: {
                args: 6,
                msg: "Password too short"
            },
            checkCommonPassword(value) {
                if (value === "password") {
                    throw new Error('Insecure password')
                }
            }
        }
    },
    tokens: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
    }
}, {
    sequelize,
    modelName: 'users',
    timestamps: true,
    freezeTableName: true,
    hooks: {
        beforeSave: (user, options) => {
            user.password = sha512(user.password).toString()
        }
    }
})

const func = async () => {
    await User.sync()
}

//func()

module.exports = User