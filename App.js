const express = require('express');
const fileUpload = require('express-fileupload');
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
app.use(express.json());
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
    if (!req.body.customerId || !req.body.uploadname) {
        return res.status(400).send('customerId and uploadname are required');
    }

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    const files = req.files.filename;
    const fileNames = Array.isArray(files) ? files.map((file) => file.name) : [files.name];

    fileNames.forEach((fileName, index) => {
        const file = Array.isArray(files) ? files[index] : files;
        const newFileName = generateShortId() + path.extname(fileName);
        const fileSizeKB = file.size / 1024;
        const fileSizeMB = fileSizeKB / 1024;

        pool.query(
            'INSERT INTO imagesurls (customerId, uploadname, filename, sizeKB, sizeMB) VALUES (?, ?, ?, ?, ?)',
            [req.body.customerId, req.body.uploadname, newFileName, fileSizeKB.toFixed(2), fileSizeMB.toFixed(2)],
            (error, results, fields) => {
                if (error) {
                    return res.status(500).send('Error saving to database');
                }
                const destination = process.env.IMAGES_PATH + newFileName;
                file.mv(destination, (err) => {
                    if (err) {
                        return res.status(500).send(err);
                    }
                    if (index === fileNames.length - 1) {
                        res.send('Files successfully uploaded as ' + newFileName);
                    }
                });
            }
        );
    });
});




app.delete('/deletefile', (req, res) => {
    const { filename } = req.body;

    pool.query(
        'DELETE FROM imagesurls WHERE filename = ?',
        [filename],
        (error, results, fields) => {
            if (error) {
                return res.status(500).send('Error deleting from database');
            }

            if (results.affectedRows > 0) {
                const filePath = path.join(process.env.IMAGES_PATH, filename);
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

app.delete('/delbyuploadname', (req, res) => {
    const { uploadname } = req.body;

    pool.query(
        'SELECT * FROM imagesurls WHERE uploadname = ?',
        [uploadname],
        (error, results, fields) => {
            if (error) {
                return res.status(500).send('Error querying from database');
            }

            if (results.length > 0) {
                results.forEach((result, index) => {
                    const filePath = path.join(process.env.IMAGES_PATH, result.filename);
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            return res.status(500).send('Error deleting file');
                        }
                        if (index === results.length - 1) {
                            pool.query(
                                'DELETE FROM imagesurls WHERE uploadname = ?',
                                [uploadname],
                                (error, results, fields) => {
                                    if (error) {
                                        return res.status(500).send('Error deleting from database');
                                    }
                                    res.send('Files successfully deleted');
                                }
                            );
                        }
                    });
                });
            } else {
                res.status(404).send('Files not found in database');
            }
        }
    );
});




app.listen(3000, () => {
    console.log('Server is running on port');
});
