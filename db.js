const { Pool} = require('pg')

const pool = new Pool({
    user: 'root',
    database: 'license',
    password: 'root',
    port: 5432,
    host: 'localhost',
})
module.exports = { pool };