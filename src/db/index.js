const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE, process.env.USER, process.env.PASSWORD, {
  dialect: 'postgres',
  host: 'localhost',
  port: '5432',
  logging: false,
});

module.exports = sequelize;
