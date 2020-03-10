const {Sequelize} = require('sequelize');

const sequelize = new Sequelize('schoolapp', 'postgres', 'AJHK@221133', {
    dialect: 'postgres',
    host: 'localhost',
    port: '5432'
})

module.exports = sequelize