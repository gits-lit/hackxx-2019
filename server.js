/***** Configurations File *****/
global.config = require('./config.json');

/***** Import Modules *****/
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const gstorage = require('@google-cloud/storage');

/***** Front End Setup *****/
const app = express();
const port = 3000;

app.use(bodyParser());
app.use(cors());
app.use(express.static(__dirname + '/public'));

// Path joins the current directory name with views (aka current directory + views)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('index', {
    test: 'test'
  });
});

app.listen(port);

/***** Cloud Storage *****/
const storage = new gstorage.Storage();
const bucketName = 'sayfeword-hackxx'

/**
 * @function downloadAudio
 *   Downloads an audio file from a Google Cloud Storage bucket
 * @param {string} bucketName The name of the Cloud Storage bucket
 * @param {string} fileName The file to download
 * @param {string} fileDestination The location to store the file
 */
 async function downloadAudio(bucketName,fileName,fileDestination) {

 	let options = {
 		destination: fileDestination
 	}

 	await storage
 	  .bucket(bucketName)
 	  .file(fileName)
 	  .download(options);
 }

let fileNameThing = 'pikachu.jpg'
 downloadAudio(bucketName, fileNameThing, fileNameThing);