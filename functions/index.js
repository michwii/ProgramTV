const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.batchTVProgramFeeder = functions.https.onRequest((request, response) => {
  var batchTVProgramFeeder = require("./batchTVProgramFeeder.js");
  batchTVProgramFeeder.runBatch(function(err, results){
    if(err) throw err;
    response.json({success : true});
  });
});

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  response.send("Hello from Firebase!");
});
