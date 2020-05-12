/* eslint-disable no-underscore-dangle */
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../db');

class Tag extends Model {
  /**
     * Update table based on tag type
     * @param {String} tag tag to be updated in table (prefix included)
     * @returns {void}
     */
  static async createUpdateTag(tag) {
    const type = '#';
    const _tag = tag;
    try {
      const ifExists = await Tag.findOne({
        where: {
          tag: _tag,
        },
      });
      if (!ifExists) {
        Tag.create({ tag: _tag, type, posts: 1 });
      } else {
        Tag.increment({ posts: 1 }, { where: { tag: _tag } });
      }
    } catch (e) {
      // do nothing
    }
  }
}

Tag.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  tag: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
    unique: true,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '#',
  },
  posts: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'tags',
  freezeTableName: true,
  timestamps: true,
});

const func = async () => {
  await Tag.sync();
};

func();

module.exports = Tag;
