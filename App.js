const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();

app.use(cors()); // Use the cors middleware
app.use(fileUpload());

// Endpoint to upload images
app.post('/upload', (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    const image = req.files.image;
    image.mv('/home/paulamar9428/images/' + image.name, (err) => {
        if (err) {
            return res.status(500).send(err);
        }

        res.send('File uploaded!');
    });
});

// Endpoint to get the list of images
app.get('/listimages', (req, res) => {
    const directoryPath = '/home/paulamar9428/images/';

    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return res.status(500).send('Unable to scan directory: ' + err);
        }

        res.json(files);
    });
});

app.listen(8080, () => {
    console.log('Server is running on port 8000');
});
