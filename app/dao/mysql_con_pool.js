const mysql = require('mysql');
const dotenv = require('dotenv').config();

const pool = mysql.createPool({
    connectionLimit: process.env.DB_CONLIMIT,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

module.exports = {pool: pool};