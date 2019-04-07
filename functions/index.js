const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

exports.myFunctionName = functions.firestore
    .document('/cases/{caseid}').onWrite((change, context) => {
  console.log('ok');
  const tokens = 'e151_hDcVD8:APA91bEiXUBEfwGNXLV0kF7mhFd4zMA8rTwPgVRVqyXZd9_APP0SbKN5cl3fXxk2avlbAskG4Wv9GMGufFvzmNy3_di25hz30HSQEIEOg3MWBoGLgF1snXtDxnnx0qtK6js-l15E5v2R';
  const payload = {
    'data': {
      'ok': 'ok'
    }
  }
  return admin.messaging().sendToDevice([tokens], payload);
})
