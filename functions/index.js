const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.batchTVProgramFeeder = functions.https.onRequest((request, response) => {
  var batchTVProgramFeeder = require("./batchs/batchTVProgramFeeder.js");
  batchTVProgramFeeder.runBatch((err, results) => {
    if(err) throw err;
    response.json({success : true});
  });
});

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  var dialogflowLibrary = require("./dialogflowFirebaseFulfillment.js");
  dialogflowLibrary.dialogflowFirebaseFulfillment(request, response);
});
