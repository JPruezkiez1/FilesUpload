const express = require('express');
const fileUpload = require('express-fileupload');
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();

function generateShortId() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

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

    const images = req.files.image;
    const imageNames = Array.isArray(images) ? images.map((image) => image.name) : [images.name];

    imageNames.forEach((imageName, index) => {
        const image = Array.isArray(images) ? images[index] : images;
        const newFileName = generateShortId() + path.extname(imageName);

        connection.query(
            'INSERT INTO imagesurls (name, image) VALUES (?, ?)',
            [req.body.name, newFileName],
            (error, results, fields) => {
                if (error) {
                    return res.status(500).send('Error saving to database');
                }
                const destination = '/home/paulamar9428/images/' + newFileName;
                image.mv(destination, (err) => {
                    if (err) {
                        return res.status(500).send(err);
                    }
                    if (index === imageNames.length - 1) {
                        res.send('Files uploaded and saved to the database!');
                    }
                });
            }
        );
    });
});

app.listen(3000, () => {
    console.log('Server is running on port');
});
