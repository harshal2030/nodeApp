const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE, 'harshal', 'AJHK@221133', {
  dialect: 'postgres',
  host: 'localhost',
  port: '5432',
  logging: false,
});

module.exports = sequelize;
