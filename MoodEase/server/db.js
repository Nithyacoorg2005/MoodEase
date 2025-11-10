// server/db.js
const { Pool } = require('pg');
require('dotenv').config(); // This loads the .env file

// This reads the DATABASE_URL from your .env file
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};