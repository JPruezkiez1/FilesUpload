const express = require('express');
const fileUpload = require('express-fileupload');
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const dotenv = require('dotenv');
dotenv.config();

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
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
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
        pool.query(
            'INSERT INTO imagesurls (name, image) VALUES (?, ?)',
            [req.body.name, newFileName],
            (error, results, fields) => {
                if (error) {
                    return res.status(500).send('Error saving to database');
                }
                const destination = process.env.IMAGES_PATH + newFileName;
                image.mv(destination, (err) => {
                    if (err) {
                        return res.status(500).send(err);
                    }
                    if (index === imageNames.length - 1) {
                        res.send('Files succesfully uploaded as ' + newFileName);
                    }
                });
            }
        );
    });
});


app.delete('/delete', (req, res) => {
    const { image } = req.body;

    pool.query(
        'DELETE FROM imagesurls WHERE image = ?',
        [image],
        (error, results, fields) => {
            if (error) {
                return res.status(500).send('Error deleting from database');
            }

            if (results.affectedRows > 0) {
                const filePath = path.join(process.env.IMAGES_PATH, image);
                fs.unlink(filePath, (err) => {
                    if (err) {
                        return res.status(500).send('Error deleting file');
                    }
                    res.send('File successfully deleted');
                });
            } else {
                res.status(404).send('File not found in database');
            }
        }
    );
});

app.listen(3000, () => {
    console.log('Server is running on port');
});
