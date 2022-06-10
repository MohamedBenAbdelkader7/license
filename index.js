const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const utils = require('./utils/index');
// const pdfTemplate = require('./utils/pdfTemplate');
// const pdfTemplate2 = require('./utils/pdf2');
const router = express.Router();
const { pool } = require("./db");
// const pdf = require('html-pdf');
const fs = require('fs');
// var html_to_pdf = require('html-pdf-node');
// var stream = require('stream');

let options = {};
// Example of options with args //
// let options = { format: 'A4', args: ['--no-sandbox', '--disable-setuid-sandbox'] };

app.set('view engine','ejs');
app.set('views', './views');

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
router.post('/',
        function(req,res){
    let errors = utils.getErrors(req.body);

    if (errors.license || errors.category || errors.birthDate) {
        return res.json({ errors: errors, body: null });
    }
    return res.json({ errors: null, data: req.body });
});
// router.post('/download',
//     async function(req,res){
//         const { license } = req.body;
//         const query = {
//             text: 'SELECT * from license_value where code=$1',
//             values: [license]
//         }
//         const response = await pool.query(query);
//         const template = pdfTemplate(response.rows[0]);
//         const template2 = pdfTemplate2(response.rows[0]);
//         let file = { content: template };
//         let file2 = { content: template2 };
//         html_to_pdf.generatePdf(file, options).then(pdfBuffer => {
//             var fileContents = Buffer.from(pdfBuffer, "base64");
//
//             var readStream = new stream.PassThrough();
//             readStream.end(fileContents);
//             readStream.pipe(fs.createWriteStream('./assets/pdf/foo.pdf'));
//             res.set('Content-disposition', 'attachment; filename=' + 'hey.pdf');
//             res.set('Content-Type', 'text/plain');
//
//             readStream.pipe(res);
//             html_to_pdf.generatePdf(file2, options).then(buffer=> {
//                 var fileContents = Buffer.from(buffer, "base64");
//
//                 var readStream = new stream.PassThrough();
//                 readStream.end(fileContents);
//                 readStream.pipe(fs.createWriteStream('./assets/pdf/foo2.pdf'));
//                 res.set('Content-disposition', 'attachment; filename=' + 'foo2.pdf');
//                 res.set('Content-Type', 'text/plain');
//
//                 readStream.pipe(res);
//
//             });
//         });
//         try {
//
//         } catch (error) {
//             console.error(error);
//         }
// });
router.post('/license', async function(req, res) {
    const { license, day, month, year, category } = req.body.data;
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
        return res.json({ body: req.body.data, errors: null })
    } catch (error) {
        console.error(error);
    }
});
app.use('/', router);
app.listen(process.env.port || 3000);

console.log('Running at Port 3000');