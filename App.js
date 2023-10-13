const express = require('express');
const fileUpload = require('express-fileupload');
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // Importing the uuid package
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

    const images = req.files.image;
    const imageNames = Array.isArray(images) ? images.map((image) => image.name) : [images.name];

    imageNames.forEach((imageName, index) => {
        const uniqueId = uuidv4(); // Generating a unique ID
        const ext = path.extname(imageName); // Getting the file extension
        const newName = `${uniqueId}${ext}`; // Creating a new file name

        const image = Array.isArray(images) ? images[index] : images;
        const destination = '/home/paulamar9428/images/' + newName;

        // Check if the file already exists in the images folder
        if (fs.existsSync(destination)) {
            return res.status(400).send('File already exists.');
        }

        connection.query(
            'INSERT INTO imagesurls (image, name) VALUES (?, ?)', // Inserting name into the database
            [newName, req.body.name || ''], // Passing the new name and the name from the request body
            (error, results, fields) => {
                if (error) {
                    return res.status(500).send('Error saving to database');
                }
                image.mv(destination, (err) => {
                    if (err) {
                        return res.status(500).send(err);
                    }
                    if (index === imageNames.length - 1) {
                        res.send('Files uploaded and saved to database!');
                    }
                });
            }
        );
    });
});

app.listen(8080, () => {
    console.log('Server is running on port 8000');
});
