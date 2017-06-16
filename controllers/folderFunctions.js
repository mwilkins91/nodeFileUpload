//for managing file types AKA "mime types". tells us what type of file things are, lets us name them, etc.
const mime = require('mime');
//gives our server access to the file system
const promisify = require("es6-promisify");
const fs = require('fs');
const mkdir = promisify(fs.mkdir);
const listFiles = promisify(fs.readdir);
//for working with google apis
const google = require('googleapis');
const OAuth2 = google.auth.OAuth2;
var drive = google.drive('v3');
const drivePermission = promisify(drive.permissions.create);
const driveFolderCreate = promisify(drive.files.create);
var key = require('../OFOBFORM.json');
var jwtClient = new google.auth.JWT( //this is confusing, but the comments here are helpful: https://github.com/google/google-api-nodejs-client/blob/master/samples/jwt.js
    key.client_email,
    null, //for .pem files... not relevent
    key.private_key, ['https://www.googleapis.com/auth/drive'], //tells Markbot what he is allowed to touch in our drive. remove readonly for full access. More info here: https://developers.google.com/drive/v2/web/about-auth.
    null //put email here if Markbot should pretend to be someone else (he will pretend to be this email)
);



// Do work here



//*** Local functions ***


const givePerms = async (fileID) => {
    console.log("\x1b[33m", 'Giving permission to view new google folder....')
    try {
        await jwtClient.authorize();

        var fileId = fileID;
        var userPermission = { //gives permission for me to access the folder (owned by MArkbot)
            'type': 'user',
            'role': 'writer',
            'emailAddress': 'mark.wilkins@uberflip.com'
        }
        const PermResponse = await drivePermission({
            resource: userPermission,
            fileId: fileId,
            fields: 'id',
            auth: jwtClient //<-- dont forget this or you'll get 401 error!
        });
        // console.log('Permission ID:' + PermResponse.id)
        console.log("\x1b[32m",'done!')
        return PermResponse.id;
    } catch (err) {
        console.error(err);
    }
}


const makeLocalFolder = async (name) => {
    console.log("\x1b[33m",'Making local folder...')
    try {
        const localFolder = await mkdir(`./uploads/${name}`);
        const listOfFiles = await listFiles('./uploads');
        // console.log(listOfFiles);
    } catch (err) {
        console.error(err)
    }
}


const makeGoogleFolder = async (name) => {
    console.log("\x1b[33m",'Making folder on google drive...')
    try {
        //describes the file (or in this case, folder) we want to create
        var fileMetadata = {
            'name': `${name}`,
            'mimeType': 'application/vnd.google-apps.folder'
        };

        //waits for Markbot to get authorization before trying to do stuff
        await jwtClient.authorize();

        //waits for folder to be created, stores response in variable
        const folderData = await driveFolderCreate({
            resource: fileMetadata,
            fields: 'id',
            auth: jwtClient
        });
        console.log('Folder Data: ', folderData)
        
        console.log("\x1b[32m",'done!')
        //waits for function that gives user permission to view new folder. stores ID in variable.
        const permissionID = await givePerms(folderData.id);

        return {
            folderData: folderData.id,
            permissionID,

        }
    } catch (err) {
        console.error(err);
    }
}




//*** Exported Functions (AKA MiddleWare)


exports.makeFolders = async function(req, res, next) {
    console.log("\x1b[31m", '**Incoming Form, kicking off form handling**')
    try {
        await makeLocalFolder(req.body.folderName) // makes LOCAL folder
        console.log("\x1b[32m",'done!')
        //NOTE: remove await from permission and permission id from folder info if we dont need it later, to speed up response time.
        const googleFolderData = await makeGoogleFolder(req.body.folderName) // makes GOOGLE folder, then gives permission to Mark to view
        const folderInfo = {
            googleFolderData,
            folderName: req.body.folderName

        }
        req.folderInfo = folderInfo;


        next();
        return;
    } catch (err) {
        console.error(err);
    }
}

exports.renameAndMoveFiles = function(req, res, next) {
    console.log("\x1b[33m",'renaming and moving uploads to new folder...')
    // console.log(req.body)
    // console.dir(req.files);
    const uploadArray = req.files;
    uploadArray.forEach((file) => {
        const fileExtension = mime.extension(file.mimetype);
         //rename file with appropriate extension(fs = filesystem)
         //(arg1 = current file path, arg2 = location of renamedfile / its new name)
         fs.rename(`uploads/${file.filename}`, `uploads/${req.folderInfo.folderName}/${file.filename}.${fileExtension}`, function(err) {
         if (err) {
             console.log('ERROR: ' + err);
         }
     });
    })
    console.log("\x1b[32m",'done!');
    next();
    return;
}