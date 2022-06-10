const { Pool} = require('pg')

const pool = new Pool({
    connectionString: 'postgres://tlpshpdcehwqfu:52b9a9417503229ff610814f76af51e53928204c99d0ce5b6e1b32bad8e3f808@ec2-52-48-159-67.eu-west-1.compute.amazonaws.com:5432/detoree9pme2vf',
    ssl: {
        rejectUnauthorized: false
    }
})
module.exports = { pool };