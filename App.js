const express = require('express');
const fileUpload = require('express-fileupload');
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(fileUpload());

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'jpruezkiez',
    password: 'kapa2122_',
    database: 'jpdb',
});

app.post('/upload', (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    const image = req.files.image;
    const imageName = image.name;

    connection.query(
        'INSERT INTO imagesurls (image) VALUES (?)',
        [imageName],
        (error, results, fields) => {
            if (error) {
                return res.status(500).send('Error saving to database');
            }
            image.mv('/home/paulamar9428/images/' + imageName, (err) => {
                if (err) {
                    return res.status(500).send(err);
                }

                res.send('File uploaded and saved to database!');
            });
        }
    );
});

app.listen(8080, () => {
    console.log('Server is running on port 8000');
});
