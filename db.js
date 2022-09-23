const { Pool} = require('pg')

const pool = new Pool({
    connectionString: 'postgres://tycomghcxtwpch:00d4fa632d4fba3fdcba451a907dd423bb154f8bdc78de333fc6ce4370f837b4@ec2-54-155-129-189.eu-west-1.compute.amazonaws.com:5432/d9tspc19r7n0a7',
    ssl: {
        rejectUnauthorized: false
    }
})
module.exports = { pool };