/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
const { Model, DataTypes } = require('sequelize');
const { Op } = require('sequelize');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const sha512 = require('crypto-js/sha512');
const fs = require('fs');
const path = require('path');
const sequelize = require('../db');
const Friend = require('./friend');
const { usernamePattern } = require('../utils/regexPatterns');

const keyPath = path.join(__dirname, '../keys/private.key');
const privateKey = fs.readFileSync(keyPath, 'utf-8');

/**
 * Intiate class for user model and its methods
 * @class User
 */
class User extends Model {
  /**
    * Checks if user exists with username and password
    * @param {String} email email of the user
    * @param {String} password password of the user
    * @returns {Object} user with specified credentials
    */
  static async findByCredentials(email, password) {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new Error('Unable to login');
    }

    const pass = user.password;
    const hashedPass = sha512(password).toString();

    if (pass !== hashedPass) {
      throw new Error('Unable to login');
    }

    return user;
  }

  /**
    * Returns a Auth token for a user
    * @member {User}
    * @returns {String} A token to be provided to user for authentication
    */
  async generateAuthToken() {
    const user = this;

    const token = jwt.sign({ username: user.username.toString() }, privateKey, { algorithm: 'RS256' });
    user.tokens.push(token);
    await user.save({ fields: ['tokens'] });
    return token;
  }

  /**
    * Returns user limited info i.e. Remove sensetive data
    * @member {User}
    * @returns {Object} User info for transmission
    */
  async removeSensetiveUserData() {
    const user = this.toJSON();
    const followers = await Friend.count({ where: { followed_username: user.username } });
    const following = await Friend.count({ where: { username: user.username } });

    return {
      name: user.name,
      username: user.username,
      adm_num: user.adm_num,
      dob: user.dob,
      createdAt: user.createdAt,
      avatarPath: user.avatarPath,
      bio: user.bio,
      location: user.location,
      headerPhoto: user.headerPhoto,
      website: user.website,
      followers,
      following,
    };
  }

  /**
     * function mainly written for the suggestion part, get the usernames on match
     *
     * @param {String} username username of the requester
     * @param {String} searchQuery query (username) to be searched in database
     * @param {number} [limit] no. of users to be returned on each call
     *
     * @returns {Array} array of objects with name, username, avatarPath
     */
  static async getMatchingUsers(username, searchQuery, limit = 6) {
    const query = `WITH cte_users AS (
            SELECT users."avatarPath", users."name", users."username" FROM users
            INNER JOIN friends ON friends."username" = users."username"
            WHERE friends."username" LIKE :searchQuery 
            AND friends."followed_username" = :username
            UNION ALL
            SELECT users."avatarPath", users."name", users."username" FROM users WHERE
            users."username" LIKE :searchQuery AND users."private" = false
            LIMIT :limit
        )
        SELECT DISTINCT ON (cte_users."username") cte_users.* FROM cte_users`;

    const result = await sequelize.query(query, {
      replacements: { username, searchQuery: `${searchQuery}%`, limit },
      raw: true,
    });

    return result[0];
  }

  /**
   * Adds isFollowing and follows_you attrbiute to array of objects, also adds url to img path.
   * @param {Array} users array of user
   * @param {String} username username of the requester
   * @returns {Array} array with added attrbutes to objects
   */
  static async getUserInfo(users, username) {
    const isFollowing = await Friend.findAll({
      where: {
        username,
        followed_username: {
          [Op.in]: users.map((user) => user.username),
        },
      },
      raw: true,
      attributes: ['followed_username'],
    }).map((follo) => follo.followed_username);

    const follows_you = await Friend.findAll({
      where: {
        followed_username: username,
        username: {
          [Op.in]: users.map((user) => user.username),
        },
      },
      attributes: ['username'],
      raw: true,
    }).map((follo_you) => follo_you.username);

    const ref = [...users];

    for (let i = 0; i < ref.length; i += 1) {
      if (isFollowing.includes(ref[i].username)) {
        ref[i].isFollowing = true;
      } else {
        ref[i].isFollowing = false;
      }

      if (follows_you.includes(ref[i].username)) {
        ref[i].follows_you = true;
      } else {
        ref[i].follows_you = false;
      }
    }

    return ref;
  }
}

User.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 101],
    },
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      args: true,
      msg: 'Username already exists, try a different one.',
    },
    validate: {
      len: [1, 26],
      is: {
        args: usernamePattern,
        msg: 'Invalid username',
      },
    },
  },
  adm_num: {
    type: DataTypes.STRING,
    validate: {
      len: [3, 10],
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      args: true,
      msg: 'Email already exists, try loging in instead.',
    },
    validate: {
      isEmail: true,
    },
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
          throw new Error('Phone number is not valid');
        }
      },
    },
  },
  avatarPath: {
    type: DataTypes.STRING,
    defaultValue: 'default.png',
  },
  headerPhoto: {
    type: DataTypes.STRING,
    defaultValue: null,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      min: {
        args: 6,
        msg: 'Password too short',
      },
      checkCommonPassword(value) {
        if (value === 'password') {
          throw new Error('Insecure password');
        }
      },
    },
  },
  bio: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  location: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  website: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  tokens: {
    type: DataTypes.ARRAY(DataTypes.STRING(2048)),
    defaultValue: [],
  },
  private: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  sequelize,
  modelName: 'users',
  timestamps: true,
  freezeTableName: true,
  hooks: {
    beforeSave: (user) => {
      user.name = validator.escape(user.name);
      user.password = sha512(user.password).toString();
    },
  },
});

sequelize.sync();

module.exports = User;
