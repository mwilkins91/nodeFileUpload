const express = require('express');
const router = express.Router();
//handles file uploads from html forms
// const multer = require('multer');
// const upload = multer({ dest: './uploads/' });
const folderFunctions = require('../controllers/folderFunctions');
const makeFolders = folderFunctions.makeFolders;
const mime = require('mime');
const fs = require('fs');
// console.log(upload)
router.get('/', (req, res) => {
    res.render('5hrform')
});

router.post('/', (req, res) => {

    // res.render('layout');
    console.log(req.body)
    console.dir(req.files);
    const uploadArray = req.files;
    uploadArray.forEach((file) => {
        const fileExtension = mime.extension(file.mimetype);
         //rename file with appropriate extension(fs = filesystem)
         //(arg1 = current file path, arg2 = location of renamedfile / its new name)
         fs.rename(`uploads/${file.filename}`, `uploads/${file.filename}.${fileExtension}`, function(err) {
         if (err) {
             console.log('ERROR: ' + err);
         }
     });
    })
    //give feedback to client
    res.send(`uploaded`)
});

//TODO: add renameAndMoveFiles() and test...
router.post('/mkdir', makeFolders, (req, res) => {
    console.log(req.body)
        // TODO: re-factor into middleware
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



//Middleware Chain
    //makeFolders()   ---next()--->   renameAndMoveFiles()   ---next()--->   writeBodyTextToDocument()   ---next()--->  uploadToDrive()   ---next()--->  deletelocalFolder() **END**
        //1) makeFolders() --> Creates local folder and Google Folder, passes names and directory onto next function via req.folderInfo{}
        //2) renameAndMoveFiles() --> Files are uploaded to ./uploads, this function takes them and adds extension (.jpg, .mov, etc), then puts them in the local folder listed in req.folderInfo{}
        //3) writeBodyTextToDocument() --> Takes text posted by the form and writes it into a document (.txt? Excel? TBD...) then puts it into the local folder.
        //4) uploadToDrive() --> Takes the local folder listed in req.folderInfo and uploads it to the google folder listed in req.folderInfo
        //5) IF UPLOAD SUCCESSFULL, delete local folder. IF NOT, try again?





        // Make an authorized request to list Drive files.
        // drive.files.list({
        //     auth: jwtClient //<--- telling it where to get auth from
        // }, function(err, resp) {
        //     // handle err and response
        //     console.log(resp) //list files in the terminal
        // });