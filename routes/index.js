const express = require('express');
const router = express.Router();
//handles file uploads from html forms
const multer = require('multer');
const upload = multer({ dest: './uploads/' });
const folderFunctions = require('../controllers/folderFunctions');
const makeLocalFolder = folderFunctions.makeLocalFolder;
const makeGoogleFolder = folderFunctions.makeGoogleFolder;

router.get('/', (req, res) => {
    res.render('5hrform')
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
        // TODO: re-factor into middleware
    makeLocalFolder(req.body.folderName) // makes LOCAL folder
    makeGoogleFolder(req.body.folderName) // makes GOOGLE folder, then gives permission to Mark to view
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