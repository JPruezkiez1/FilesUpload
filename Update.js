const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');

const dotenv = require('dotenv');
dotenv.config();

console.log(process.env);

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

fs.readdir(process.env.IMAGES_PATH, (err, files) => {
    if (err) {
        console.error("Could not list the directory.", err);
        process.exit(1);
    }

    files.forEach((file, index) => {
        const filePath = path.join(process.env.IMAGES_PATH, file);
        fs.stat(filePath, (error, stats) => {
            if (error) {
                console.error("Error reading file:", error);
                return;
            }

            const fileSizeKB = stats.size / 1024;
            const fileSizeMB = fileSizeKB / 1024;

            pool.query(
                'UPDATE imagesurls SET sizeKB = ?, sizeMB = ? WHERE image = ?',
                [fileSizeKB.toFixed(2), fileSizeMB.toFixed(2), file],
                (error, results, fields) => {
                    if (error) {
                        console.error("Error updating database:", error);
                        return;
                    }
                    console.log(`Updated file size for ${file}`);
                }
            );
        });
    });
});
