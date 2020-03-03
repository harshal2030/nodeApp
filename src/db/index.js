const {Pool} = require('pg');

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "schoolapp",
    password: "AJHK@221133",
    port: 5432,
})

module.exports = {
    query: (text, params) => pool.query(text, params),
}