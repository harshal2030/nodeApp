const {Model, DataTypes} = require('sequelize');
const sequelize = require('./../db')
const validator = require('validator')
const jwt = require('jsonwebtoken');
const sha512 = require('crypto-js/sha512')
const fs = require('fs')
const path = require('path')
const Friend = require('./friend');

const keyPath = path.join(__dirname, '../keys/private.key')
const privateKey = fs.readFileSync(keyPath ,'utf-8');

class User extends Model {
    /** 
    * Checks if user exists with username and password
    * @param {String} email email of the user
    * @param {String} password password of the user 
    * @returns {Object} user with specified credentials
    */
    static async findByCredentials(email, password) {
        const user = await User.findOne({where: {email}})

        if (!user) {
            throw new Error('Unable to login')
        }

        const pass = user.password
        const hashedPass = sha512(password).toString()

        if (pass !== hashedPass) {
            throw new Error('Unable to login')
        }

        return user
    }

    static async addFriend(username, followed_username) {
        const result = await Friend.create({username, followed_username});
        console.log(result);
    }

    /**
    * Returns a Auth token for a user
    * @member {User}
    * @returns {String} A token to be provided to user for authentication 
    */
    async generateAuthToken() {
        const user = this;

        const token = jwt.sign({username: user.username.toString()}, privateKey, {algorithm: 'RS256'})
        user.tokens.push(token)
        await user.save({fields: ['tokens']})
        return token;
    }
    /**
    * Returns user limited info i.e. Remove sensetive data
    * 
    * @returns {Object} User info for transmission
    */
    async removeSensetiveUserData() {
        const user = this.toJSON();
        const followers = await Friend.count({where: {followed_username: user.username}});
        const following = await Friend.count({where: {username: user.username}});

        return {
            name: user.name,
            username: user.username,
            adm_num: user.adm_num,
            dob: user.dob,
            createdAt: user.createdAt,
            avatarPath: user.avatarPath,
            bio: user.bio,
            location: user.location,
            followers,
            following
        }
    }
}

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
        type: DataTypes.STRING,
        validate: {
            checkPhoneNumber(value) {
                if (!validator.isMobilePhone(value)) {
                    throw new Error("Phone number is not valid")
                }
            }
        }
    },
    avatarPath: {
        type: DataTypes.STRING,
        defaultValue: '/images/avatar/default.png'
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
    bio: {
        type: DataTypes.STRING,
    },
    location:{
        type: DataTypes.STRING,
    },
    tokens: {
        type: DataTypes.ARRAY(DataTypes.STRING(2048)),
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
            user.username = user.username.toLowerCase();
        }
    }
})

const func = async () => {
    await sequelize.sync({alter: true})
}

//func()

module.exports = User