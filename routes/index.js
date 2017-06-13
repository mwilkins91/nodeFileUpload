const express = require('express');
const router = express.Router();

//handles file uploads from html forms
const multer = require('multer');
const upload = multer({ dest: './uploads/' });

//for managing file types AKA "mime types". tells us what type of file things are, lets us name them, etc.
const mime = require('mime');
//gives our server access to the file system
const fs = require('fs');


//for working with google apis
const google = require('googleapis');
const OAuth2 = google.auth.OAuth2;
var drive = google.drive('v3');

var key = require('../OFOBFORM.json');
var jwtClient = new google.auth.JWT( //this is confusing, but the comments here are helpful: https://github.com/google/google-api-nodejs-client/blob/master/samples/jwt.js
  key.client_email,
  null, //for .pem files... not relevent
  key.private_key,
  ['https://www.googleapis.com/auth/drive.readonly'], //tells Markbot what he is allowed to touch in our drive. remove readonly for full access. More info here: https://developers.google.com/drive/v2/web/about-auth.
  null //put email here if Markbot should pretend to be someone else (he will pretend to be this email)
);

jwtClient.authorize(function (err, tokens) {
  if (err) {
    console.log(err);
    return;
  }

  // Make an authorized request to list Drive files.
  drive.files.list({
    auth: jwtClient
  }, function (err, resp) {
    // handle err and response
    console.log(resp) //list files in the terminal
  });
});

// Do work here


router.get('/', (req, res) => {
    // res.render('layout');
    console.log(req.body)
    // res.send('hello!')
    res.render('5hrform')
    // console.log(drive)
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
