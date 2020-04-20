const {Model, DataTypes} = require('sequelize');
const sequelize = require('../db');

class Block extends Model {}

Block.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    blocked: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    blockedBy: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    sequelize,
    timestamps: true,
    modelName: 'blocks',
    freezeTableName: true,
})

const func = async () => {
    Block.sync()
}

func();

module.exports = Block;