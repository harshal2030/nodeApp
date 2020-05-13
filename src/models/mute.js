const { DataTypes, Model } = require('sequelize');
const sequelize = require('../db');

class Mute extends Model {}

Mute.init({
  muted: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  mutedBy: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'mutes',
  freezeTableName: true,
  timestamps: true,
});

const func = async () => {
  await Mute.sync();
};

func();

module.exports = Mute;
