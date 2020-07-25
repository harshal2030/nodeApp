/* eslint-disable no-underscore-dangle */
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db';

interface TagAttr {
  id: number;
  tag: string;
  type: string;
  posts: number;
}

class Tag extends Model implements TagAttr {
  public id!: number;
  public tag!: string;
  public type!: string;
  public posts!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  /**
     * Update table based on tag type
     * @param {String} tag tag to be updated in table (prefix included)
     * @returns {void}
     */
  static async createUpdateTag(tag: string): Promise<void> {
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
  timestamps: false,
});

export { Tag, TagAttr };
