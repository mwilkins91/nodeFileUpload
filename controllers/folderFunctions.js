//for managing file types AKA "mime types". tells us what type of file things are, lets us name them, etc.
const mime = require('mime');
//gives our server access to the file system
const promisify = require("es6-promisify");
const fs = require('fs');
const mkdir = promisify(fs.mkdir);
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

exports.makeLocalFolder = async (name) => {
    try {
        await mkdir(`./uploads/${name}`)
    } catch (err) {
        console.error(err)
    }
}

const givePerms = (fileID) => {
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

exports.makeGoogleFolder = async (name) => {
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