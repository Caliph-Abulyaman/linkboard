const { Pool } = require('pg');

const fs = require('fs');

const password = fs.readFileSync('/run/secrets/postgres_password', 'utf-8').trim();

const pool = new Pool({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT || 5432,
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password,
});

module.exports = pool;