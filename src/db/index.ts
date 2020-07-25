import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
  database: process.env.DATABASE,
  username: process.env.USER,
  password: process.env.PASSWORD,
  dialect: 'postgres',
  port: 5432,
  host: 'localhost',
  logging: false,
});

export { sequelize };
