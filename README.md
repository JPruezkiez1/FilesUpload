# File Upload Server 
## Requirements
 -  **Ubuntu or linux based VM or server ( you can use your own, but the installation might not work properly )**
 - **Mysql database locally or remotelly hosted**
 - **Nodejs**

## Installation
For the installation and configuration:
 

 1. SSH into your VM
 2. Run the following commands to install the neccesary linux dependencies and nodejs:
 
         `sudo apt update`
         `sudo apt install nodejs`
         `sudo apt install nginx`
  
 3. Clone the FileUpload repository
        `git clone https://github.com/JPruezkiez1/FilesUpload.git`
 
 4. access the API directory and install all the dependencies:
       `cd /FilesUpload/`
       `npm i` or `npm install`
       
 5. create an .env file with the following:
`DB_HOST=host ip or name
DB_USER=yourusername
DB_PASSWORD=yourpassword
DB_DATABASE=jpdb
IMAGES_PATH=/path/to/images/`

**NOTE: make sure to have the correct images path, this can be any folder or directory you want.**

 6. configure your database to contain the correct table (imagesurls) with the appropiate columns (image and name, both should be varchar)

 7. Run the nodejs application
  `enter the directory of the FilesUpload API and run the command node App.js, you can use a tool like screen or PM2 to manage this`


Now your API is working properly! rember to open the port the nodejs application is running on, this will be the entrance of files into your system.

## Configure your NGINX
We will proceed to configure the NGINX server block

   start NGINX with `sudo systemctl start nginx`


  Create your server block, **make sure to name it correctly** `sudo nano /etc/nginx/sites-available/imgserv`
    
add the following data: 
`
server {
    listen 80;
    location /imagescheck/ {
        alias /path/to/images/;
        autoindex on;
    }
}
`

Enable the server block `sudo ln -s /etc/nginx/sites-available/imgserv /etc/nginx/sites-enabled/`
Test the NGINX configuration `sudo nginx -t`
Reload the NGINX configuration `sudo systemctl reload nginx`

### Access the API and the NGINX server:
You may now access your API with port you defined, e.g **http://yourhost:8080/upload**  this would be the the link and the endpoint.

to access the NGINX server, you might use **http://yourhost.com/imagescheck/image.jpg**

### Check your images directory to see your actual files names as they get changed once uploaded

## API responses
### 200OK
`Files succesfully uploaded as jPvE1n.jpg`
### 400 Bad Request
`No files were uploaded.`

---
