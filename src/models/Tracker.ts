import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db';
import { usernamePattern } from '../utils/regexPatterns';

interface TrackerAttr {
  username: string;
  token: string;
  os: string;
  osVersion: string;
  deviceBrand: string;
  buildNumber: string;
  fontScale: string;
  notificationToken: string;
  uniqueId: string;
}

class Tracker extends Model implements TrackerAttr {
  username!: string;
  token!: string;
  os!: string;
  osVersion!: string;
  deviceBrand!: string;
  buildNumber!: string;
  fontScale!: string;
  notificationToken!: string;
  uniqueId!: string;
}

Tracker.init({
  username: {
    type: DataTypes.STRING,
    validate: {
      len: [1, 26],
      is: {
        args: usernamePattern,
        msg: 'Invalid username',
      },
    },
  },
  token: {
    type: DataTypes.STRING(2048),
  },
  os: {
    type: DataTypes.STRING,
  },
  osVersion: {
    type: DataTypes.STRING,
  },
  deviceBrand: {
    type: DataTypes.STRING,
  },
  buildNumber: {
    type: DataTypes.STRING,
  },
  fontScale: {
    type: DataTypes.STRING,
  },
  notificationToken: {
    type: DataTypes.STRING,
  },
  uniqueId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
}, {
  sequelize,
  timestamps: true,
  modelName: 'tracker',
  freezeTableName: true,
});

export { Tracker, TrackerAttr };
