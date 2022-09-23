const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const utils = require('./utils/index');
const pdfTemplate = require('./utils/pdfTemplate');
const router = express.Router();
const { pool } = require("./db");
const fs = require('fs');
const stream = require('stream');
const pdf = require('html-pdf');

let options = { "orientation": "portrait", "format": "A2", };

app.set('view engine','ejs');
app.set('views', './views');

let currentLicense = null;

// for parsing application/json
app.use(bodyParser.json());

// for parsing application/xwww-
app.use(bodyParser.urlencoded({extended: false}));
//form-urlencoded
app.use(express.static(path.join(__dirname, 'assets')));

router.get('/favicon.ico', (req, res) => res.status(204));
router.get('/',function(req,res){
    res.render('home', { errors: null });
});
router.get('/admin/new',async function(req,res){
    
    pool.connect();
    const query = {
        text: 'SELECT * from license_value'
    }
    try {
        const response = await pool.query(query);
        // success
        res.render('admin.ejs', { licenses: response.rows });
    } catch (error) {
        res.render(error)
        console.error(error);
    }
});
router.get('/license', async (req, res) => {
    const query = {
        text: 'SELECT * from license_value'
    }
    try {
        const response = await pool.query(query);
        // success
        console.log('response rows => ', response.rows);
        return res.json({ body: response.rows, errors: null })
    } catch (error) {
        console.error(error);
    }
})

router.post('/',
        function(req,res){
    let errors = utils.getErrors(req.body);
    console.log('errors =>', errors);
    if (errors.license || errors.category || errors.birthDate || errors.captcha) {
        return res.json({ errors: errors, body: null });
    }
    return res.json({ errors: null, body: req.body });
});
router.post('/admin/new', function(req,res){
    const { code, firstname, lastname, day, month, year, category, expert, delivery_date } = req.body;
    console.log('req body');
    console.log(req.body);
    if (!code || !firstname || !lastname || !day || !month || !year || !category || !expert || !delivery_date) {
     return res.json({ errors: true, body: null });
    }
    const query = {
        text: `INSERT INTO "license_value" ("code", "firstname", "lastname", "day", "month", "year", "category", "expert", "delivery_date")  
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        values: [code, firstname, lastname, day, month, year, category, expert, delivery_date]
    };
    // INSERT INTO license_value(code, firstname, lastname, day, month, year, category, expert, delivery_date) VALUES (160638100251, ‘MAJERUS’,’JULIEN’, 20, 08, 2000, A2, ‘0145’, '2013-06-01');
    pool.query(query, async (err, result) => {
            const query = {
                text: 'SELECT * from license_value'
            }
            try {
                const response = await pool.query(query);
                // success
                return res.render('admin.ejs', { licenses: response.rows });
            } catch (error) {
                console.error(error);
            }
        }
    );

});
router.post('/admin/search', async function(req,res){
    const { search } = req.body;
    const query = {
        text: 'SELECT * from license_value where LOWER(firstname) like lower($1) or lower(lastname) like $1 or lower(category) like lower($1)',
        values: [ '%' + search + '%' ]
    }
    try {
        const response = await pool.query(query);
        console.log("response => ", response.rows);
        // success
        return res.render('admin.ejs', { licenses: response.rows });
    } catch (error) {
        console.error(error);
    }
});

router.post("/admin/delete/:id", async (req, res) => {
    const deleteQuery = {
        text: 'DELETE from license_value where id=$1',
        values: [req.params.id]
    };
    try {
        await pool.query(deleteQuery);
        const query = {
            text: 'SELECT * from license_value'
        }
        try {
            const response = await pool.query(query);
            // success
            return res.render('admin.ejs', { licenses: response.rows });
        } catch (error) {
            console.error(error);
        }
        // success
        return res.render('admin.ejs', { licenses: response.rows });
    } catch (error) {
        console.error(error);
    }
})
router.get('/download',
    async function(req,res){
        const license  = req.params.id;
        const query = {
            text: 'SELECT * from license_value where code=$1',
            values: [currentLicense]
        }
        const response = await pool.query(query);
        console.log('response => ', response.rows);
        const template = pdfTemplate(response.rows[0]);
        pdf.create(template, options).toBuffer(function(err, buffer){
            res.setHeader('Content-Disposition', 'attachment; filename=' + currentLicense + '.pdf');
            res.setHeader('Content-Type', 'application/pdf');
            res.send(buffer)
        });
        try {

        } catch (error) {
            console.error(error);
        }
});
router.post('/license', async function(req, res) {
    const { license, day, month, year, category } = req.body;
    const query = {
        text: 'SELECT * from license_value where code=$1 and category=$2 and day=$3 and month=$4 and year=$5',
        values: [license, category, day, month, year]
    }
    try {
        const response = await pool.query(query);
        if (!response.rows.length) {
            return res.json({ errors: [
                    "erreur d'authentification:",
                    "vos identifiants sont peut-être erronés",
                    "vos résultats ne sont pas encore disponibles"
                ]
            })
        }
        // success
        currentLicense = license;
        return res.json({ body: req.body, errors: null, license });
    } catch (error) {
        console.error(error);
    }
});
app.use('/', router);
app.listen(process.env.PORT || 3000);

console.log('Running at Port 3000');