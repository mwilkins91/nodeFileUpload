const express = require('express');
const router = express.Router();
//handles file uploads from html forms
// const multer = require('multer');
// const upload = multer({ dest: './uploads/' });
const folderFunctions = require('../controllers/folderFunctions');
const makeFolders = folderFunctions.makeFolders;
const renameAndMoveFiles = folderFunctions.renameAndMoveFiles;
const mime = require('mime');
const fs = require('fs');
// console.log(upload)

router.get('/', (req, res) => {
    res.render('5hrform')
});


//TODO: add renameAndMoveFiles() and test...
router.post('/mkdir', makeFolders, renameAndMoveFiles, (req, res) => {
    console.log(req.body)
        // TODO: re-factor into middleware
        console.log("\x1b[32m",'🚀 Sending Response to user! 😀')
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