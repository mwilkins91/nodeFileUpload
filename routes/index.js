const express = require('express');
const router = express.Router();

//handles file uploads from html forms
const multer = require('multer');
const upload = multer({ dest: './uploads/' });

//for managing file types AKA "mime types". tells us what type of file things are, lets us name them, etc.
const mime = require('mime');
//gives our server access to the file system
const fs = require('fs');





// Do work here


router.get('/', (req, res) => {
    // res.render('layout');
    console.log(req.body)
    res.send('hello!')
});

router.post('/', upload.single('img'), (req, res) => {

    // res.render('layout');
    console.log(req.body)
    console.dir(req.file);

    //gives you the proper extension (IE .jpg, .mp4, etc) for your file based on its mimetype
    const fileExtension = mime.extension(req.file.mimetype);

    //rename file with appropriate extension (fs = filesystem)
    //(arg1 = current file path, arg2 = location of renamedfile/its new name)
    fs.rename(`uploads/${req.file.filename}`, `uploads/${req.file.filename}.${fileExtension}`, function(err) {
        if (err) {
            console.log('ERROR: ' + err);
        }
    });

    //give feedback to client
    res.send(`Thank you for uploading ${req.file.originalname}, it has been renamed to ${req.file.filename}.${fileExtension} in the uploads folder.`)
});

module.exports = router;
