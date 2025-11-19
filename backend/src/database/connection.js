const { Sequelize } = require('sequelize');
require('dotenv').config();

// Support both Postgres (default) and SQLite for local/dev setups
function createSequelizeInstance() {
  const isDevelopment = process.env.NODE_ENV === 'development';
  // In development, prefer SQLite by default to avoid external dependencies
  const databaseUrl = isDevelopment
    ? (process.env.DATABASE_URL || 'sqlite:./dev.sqlite')
    : process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not defined. Please set it in your environment (.env).');
  }

  const commonOptions = {
    logging: isDevelopment ? console.log : false,
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  };

  // SQLite URL format expected: sqlite:./dev.sqlite or sqlite::memory:
  if (databaseUrl.startsWith('sqlite:')) {
    const storage = databaseUrl.replace('sqlite:', '') || ':memory:';
    return new Sequelize({
      dialect: 'sqlite',
      storage,
      ...commonOptions
    });
  }

  // Default to Postgres when not SQLite
  return new Sequelize(databaseUrl, {
    dialect: 'postgres',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    ...commonOptions
  });
}

const sequelize = createSequelizeInstance();

module.exports = { sequelize };

