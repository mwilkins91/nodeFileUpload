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
    key.private_key, ['https://www.googleapis.com/auth/drive'], //tells Markbot what he is allowed to touch in our drive. remove readonly for full access. More info here: https://developers.google.com/drive/v2/web/about-auth.
    null //put email here if Markbot should pretend to be someone else (he will pretend to be this email)
);



// Do work here

async function makeLocalFolder(name) {
    try {
        await fs.mkdir(`./uploads/${name}`)
    } catch (err) {
        console.error(err)
    }
}

function givePerms(fileID) {
    jwtClient.authorize(function(err, tokens) { // Authorizes Markbot to do things
        if (err) {
            console.log(err);
            return;
        }
        var fileId = fileID;
        var userPermission = { //gives permission for me to access the folder (owned by MArkbot)
            'type': 'user',
            'role': 'writer',
            'emailAddress': 'mark.wilkins@uberflip.com'
        }
        drive.permissions.create({
            resource: userPermission,
            fileId: fileId,
            fields: 'id',
            auth: jwtClient //<-- dont forget this or you'll get 401 error!
        }, function(err, res) {
            if (err) {
                // Handle error
                console.log(err);
            } else {
                console.log('Permission ID: ', res.id)
            }
        });
    });
}

async function makeGoogleFolder(name) {
    var fileMetadata = {
        'name': `${name}`,
        'mimeType': 'application/vnd.google-apps.folder'
    };
    try {
    await jwtClient.authorize(function(err, tokens) { // Authorizes Markbot to do things
        if (err) {
            console.log(err);
            return;
        }
        drive.files.create({
            resource: fileMetadata,
            fields: 'id',
            auth: jwtClient
        }, function(err, file) {
            if (err) {
                // Handle error
                console.log(err);
            } else {
                console.log('Folder Id: ', file.id);
                givePerms(file.id)
            }
        });
    });
  } catch(err) {
    console.err(err);
  }
}

router.get('/', (req, res) => {
    // res.render('layout');
    console.log(req.body)
    res.send('hello!')
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

router.post('/mkdir', (req, res) => {
    console.log(req.body)
        // fs.mkdir()
    makeLocalFolder(req.body.folderName) // makes LOCAL folder
    makeGoogleFolder(req.body.folderName) // makes GOOGLE folder
    res.send(req.body.folderName)
})


module.exports = router;

//Pseudo Code
// Form submission hits route 
//folder is created (fs.mkdir($PATH)) yes
//files are uploaded
//Generate doc from content, save with uploads Spreadsheet? https://stackoverflow.com/questions/17450412/how-to-create-an-excel-file-with-nodejs

//Then, send folder to drive
//IF SUCCESFULL delete server copy of folder




        // Make an authorized request to list Drive files.
        // drive.files.list({
        //     auth: jwtClient //<--- telling it where to get auth from
        // }, function(err, resp) {
        //     // handle err and response
        //     console.log(resp) //list files in the terminal
        // });