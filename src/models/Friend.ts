/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db';
import { usernamePattern } from '../utils/regexPatterns';

interface FriendAttr {
  username: string;
  followed_username: string;
  notify: Boolean;
}

/**
 * Class for friends table
 * @class Friend
 */
class Friend extends Model implements FriendAttr {
  public username!: string;
  public followed_username!: string;
  public notify!: Boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  /**
     * Functions to get user's following
     *
     * @param {String} username  username of the user
     * @param {number} [skip] no. of skips when end reached
     * @param {number} [limit] no. of users to be returned on each call
     *
     * @return {Array} array of user with their username, name, avatarPath
     */
  static async getUserFollowing(username: string, skip = 0, limit = 30) {
    const query = `SELECT users."username", users."name", users."avatarPath", users."id" FROM 
                        (SELECT friends."followed_username" FROM friends
                        WHERE friends."username" = :username
                        OFFSET :skip LIMIT :limit)
                    AS followings INNER JOIN users ON users."username" = followings."followed_username"`;

    const result = await sequelize.query(query, {
      replacements: { username, skip, limit },
      raw: true,
    });

    return result[0];
  }

  /**
     * Function to get user's followers
     *
     * @param {String} username  username of the user
     * @param {number} [skip] no. of skips when end reached
     * @param {number} [limit] no. of users to be returned on each call
     *
     * @return {Array} array of user with their username, name, avatarPath
     */
  static async getUserFollowers(username: string, skip = 0, limit = 30) {
    const query = `SELECT users."username", users."name", users."avatarPath", users."id" FROM 
                        (SELECT friends."username" FROM friends
                        WHERE friends."followed_username" = :username
                        OFFSET :skip LIMIT :limit)
                    AS followings INNER JOIN users ON users."username" = followings."username"`;

    const result = await sequelize.query(query, {
      replacements: { username, skip, limit },
      raw: true,
    });

    return result[0];
  }
}

Friend.init({
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 26],
      is: {
        args: usernamePattern,
        msg: 'Invalid username',
      },
    },
  },
  followed_username: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 26],
      is: {
        args: usernamePattern,
        msg: 'Invalid username',
      },
    },
  },
  notify: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  validate: {
    checkUsers() {
      if (this.username === this.followed_username) {
        throw new Error('Got identical key value pairs');
      }
    },
  },
  sequelize,
  timestamps: true,
  modelName: 'friends',
  freezeTableName: true,
});

export { FriendAttr, Friend };
