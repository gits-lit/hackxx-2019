/***** Configurations File *****/
global.config = require('./config.json');

/***** Import Modules *****/
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const gstorage = require('@google-cloud/storage');
const socket = require('socket.io');
const http = require('http');
const firebase = require("firebase");
const vision = require('@google-cloud/vision');
const language = require('@google-cloud/language');
const ffmpeg = require('fluent-ffmpeg');
const speech = require('@google-cloud/speech');
const fs = require('fs');

// Instantiates a speech client
const speechClient = new speech.SpeechClient();

// Instantiates a language client
const languageClient = new language.LanguageServiceClient();

/***** Front End Setup *****/
const app = express();

// Socket.io is set to listen to port 3000, which should house the front-end
const server = http.createServer(app);
const io = socket.listen(server);

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

/***** Listen to port *****/
const port = process.env.PORT || 3000;
server.listen(port, '0.0.0.0', () => {
  console.log(`Listening on Port ${port}`);
});

/***** GeoJSON and JSON objects *****/
let geoJson = []
let dataTable = {}

/**** Generate geoJson and json from Firebase *****/

// Firebase setup
const fb_config = {
  apiKey: process.env.API_KEY || config.apiKey,
  authDomain: process.env.AUTH_DOMAIN || config.authDomain,
  databaseURL: process.env.DATABASE_URL || config.databaseURL,
  projectId: process.env.PROJECT_ID || config.projectId,
  storageBucket: process.env.STORAGE_BUCKET || config.storageBucket,
  messagingSenderId: process.env.MESSAGING_SENDER_ID || config.messagingSenderId
}

firebase.initializeApp(fb_config);
const db = firebase.firestore();
const collection = db.collection('cases');

collection.get()
.then(snapshot => {
  if (snapshot.empty) {
    console.log('No matching documents.');
    return;
  }

  snapshot.forEach(doc => {
    let dataObject = doc.data();
    let geoJSONObject = {
      "type": "Feature",
      "properties": {
        "id": doc.id
      },
      "geometry": {
          "type": "Point",
          "coordinates": [dataObject.lng, dataObject.lat]
      }
    }

    geoJson.push(geoJSONObject);
    dataTable[doc.id] = dataObject;
    console.log('HERE IS THE GEOJSON');
    console.log(geoJson);
    console.log('HERE IS THE TABLE');
    console.log(dataTable);
  })
});



/***** Cloud Storage *****/
const storage = new gstorage.Storage();
const pictureBucket = 'hackxx-pictures';
const audioBucket = 'hackxx-audio';

/***** Cloud Vision *****/
const visionClient = new vision.ImageAnnotatorClient();

/**
 * @function downloadFile
 *   Downloads a file from a Google Cloud Storage bucket
 * @param {string} bucketName The name of the Cloud Storage bucket
 * @param {string} fileName The file to download
 * @param {string} fileDestination The location to store the file
 */
 async function downloadFile(bucketName,fileName, audio, callback) {
   dest = 'pictures';
  if(audio) {
    dest = 'audio';
  }
 	let options = {
 		destination: `public/${dest}/${fileName}`
 	}
  await storage
 	  .bucket(bucketName)
 	  .file(fileName)
 	  .download(options);
  await callback();
 }

  /**
   * @function analyzeImage
   *   Analyzes image for danger analysis
   * @param {string} fileName The file to analyze
   */
  async function analyzeImage(fileName) {
    let [mood] = await visionClient.faceDetection(`public/pictures/${fileName}`);
    let [safety] = await visionClient.safeSearchDetection(`public/pictures/${fileName}`);
    let feeling = mood.faceAnnotations;
    let violence = rankLikeliness(safety.safeSearchAnnotation.violence);
    let emotion = rankLikeliness(feeling.sorrowLikelihood) + rankLikeliness(feeling.angerLikelihood);
    let safetyRanking = violence + emotion;
    let safetyLevel = '';
    if(safetyRanking >= 6) {
      safetyLevel = 1;
    }
    else if (safetyRanking <= 2) {
      safetyLevel = 3;
    }
    else {
      safetyLevel = 2;
    }
    io.emit('picture', {
      filename: `pictures/${fileName}`,
      safety: safetyLevel
    });
  }

  /**
   * @function rankLikeliness
   *   Converts likeliness to a number
   * @param {string} likeliness A likeliness value to convert
   * @return {number} A number
   */
  function rankLikeliness(likeliness) {
    switch(likeliness) {
      case 'VERY_LIKELY':
        return 6;
      case 'LIKELY':
        return 4;
      case 'POSSIBLE':
        return 2;
      default:
        return 0
    }
  }

  /**
   * @function analyzeAudio
   *  Analyzes audio
   */
  function analyzeAudio(fileName) {
    convertToWav(fileName, async function() {
      let transcription = await convertToText(fileName);

      let document = {
        content: transcription,
        type: 'PLAIN_TEXT',
      };

      // Detects the sentiment of the text
      await languageClient
        .analyzeSentiment({document: document})
        .then(results => {
          const sentiment = results[0].documentSentiment;

          io.emit('audio', {
            filename: `audio/${fileName}.wav`,
            content: transcription,
            safety: sentiment.score
          });
        })
        .catch(err => {
          console.error('ERROR:', err);
        });
    });
  }

  /**
   * @function convertToText
   *  Converts a Wav file to text
   */
  async function convertToText(fileName) {
         // The name of the audio file to transcribe
    let name = `public/audio/${fileName}.wav`;

    // Reads a local audio file and converts it to base64
    let file = fs.readFileSync(name);
    let audioBytes = file.toString('base64');

    // The audio file's encoding, sample rate in hertz, and BCP-47 language code
    let audio = {
      content: audioBytes,
    };
    let config = {
      encoding: 'LINEAR16',
      sampleRateHertz: 44100,
      languageCode: 'en-US',
    };
    let request = {
      audio: audio,
      config: config,
    };

    // Detects speech in the audio file
    let [response] = await speechClient.recognize(request);
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');
    return transcription;
  }


  /**
   * @function convertToWav
   *  Converts a file to wav format
   */
   function convertToWav(fileName, callback) {
     let track = `public/audio/${fileName}.mp3`;//your path to source file

     ffmpeg(track)
     .toFormat('wav')
     .on('error', (err) => {
         console.log('An error occurred: ' + err.message);
     })
     .on('progress', (progress) => {
         // console.log(JSON.stringify(progress));
         console.log('Processing: ' + progress.targetSize + ' KB converted');
     })
     .on('end', () => {
         console.log('Processing finished !');
         callback();
     })
     .save(`public/audio/${fileName}.wav`);//path where you want to save your file
   }


 /* Socket.io check listen */
io.on('connection', (socket) => {
  console.log(`${socket} is connected`);
  socket.emit('map', geoJson);

  // User requested latitude longitude, now provide information on the danger
  socket.on('case', (data) => {
    console.log(data);
    socket.emit('profile', dataTable[data]);
    let photoFileName = dataTable[data].filename + '.png';
    let audioFileName = dataTable[data].filename + '.mp3';
    downloadFile(pictureBucket, photoFileName, false, function() {
      console.log('Done downloading pictures');
      analyzeImage(photoFileName);
    });
    downloadFile(audioBucket, audioFileName, true, function() {
      console.log('Done downloading audio');
      analyzeAudio(dataTable[data].filename);
    });
  });
});

//let fileNameThing = 'pikachu.jpg';
//downloadAudio(bucketName, fileNameThing, fileNameThing);
//analyzeImage('angryu.png');
