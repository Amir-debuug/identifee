const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '../../.env'),
});

const { NODE_ENV, DB_USERNAME, DB_PASSWORD, DB_DATABASE, DB_HOST } =
  process.env;

const config = {
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  host: DB_HOST,
  dialect: 'postgres',
};

module.exports = {
  [NODE_ENV]: config,
  development: config,
  staging: config,
  production: config,
};
