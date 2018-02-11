const admin = require('firebase-admin');
const functions = require('firebase-functions');
var request = require('request');
var parseString = require('xml2js').parseString;
var async = require('async');

//Checking on which environement we are.
if(process.env.ENV === "DEV"){
  //We are using the local computer
  var serviceAccount = require("./secretKeyServiceAccount.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}else{ // Using Firebase function
  admin.initializeApp(functions.config().firebase);
}

var db = admin.firestore();

var runBatch = (callback) => {
  var currentDate = new Date();
  var stringDaysForRSSRequest = (currentDate.getDate() < 10 ? '0' : '') + currentDate.getDate() + '-' + (currentDate.getMonth() < 10 ? '0' : '') + (currentDate.getMonth() + 1) + '-' + currentDate.getFullYear();
  var url = "https://webnext.fr/epg_cache/programme-tv-rss_"+ stringDaysForRSSRequest +".xml";
  getRawTVProgram(url, function(err, rawTVProgram){
    if(err) throw err;
    var cleanTVprogram = extractTVProgramFromRaw(rawTVProgram);
    storeAllTVPrograms(cleanTVprogram, callback);
  });
}

var getRawTVProgram = (url, callback) => {
  request.get(url, function(err, response, body){
    if(err) throw err;
    parseString(body, function (err, result) {
      if(err) throw err;
      var rawTVProgram = result.rss.channel[0].item;
      callback(err, rawTVProgram);
    });
  });
};

var extractTVProgramFromRaw = (rawTVProgram) => {
  var previousProgram = null;
  for(tvProgram of rawTVProgram){
    tvProgram.channel = tvProgram.title[0].substring(0, tvProgram.title[0].indexOf('|')-1);
    var hourProgram = tvProgram.title[0].substring(tvProgram.title[0].indexOf('|')+2, tvProgram.title[0].lastIndexOf('|')-1);

    var currentDate = new Date();
    tvProgram.startingTime = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), hourProgram.substring(0,2), hourProgram.substring(3,5));

    if(previousProgram !== null && previousProgram.channel === tvProgram.channel){
      previousProgram.endingTime = tvProgram.startingTime;
    }
    tvProgram.programName = tvProgram.title[0].substring(tvProgram.title[0].lastIndexOf('|')+2, tvProgram.title[0].length);
    tvProgram.description = tvProgram.description[0];
    tvProgram.category = tvProgram.category[0];
    tvProgram.link = tvProgram.link[0];
    tvProgram.rating = tvProgram.comments[0];
    delete tvProgram.title;
    delete tvProgram.comments;

    previousProgram = tvProgram;
  }
  return rawTVProgram;
};

var storeAllTVPrograms = (allTVProgram, callback) => {
  var allRequests = [];
  for(var tvProgram of allTVProgram){
    allRequests.push(storeSingleTVProgram.bind(null, tvProgram));
  }
  async.parallelLimit(allRequests, 20, function(err, results){
    if(err) throw err;
    callback(err, results);
  });
};

var storeSingleTVProgram = (data, callback) => {
  var tvProgramToStore = db.collection('fr-tv-program').add(data).then(ref => {
      return void callback(null, ref);
  }).catch(err => {
    throw err;
  });
};

exports.runBatch = runBatch;
exports.getRawTVProgram  = getRawTVProgram ;
exports.extractTVProgramFromRaw = extractTVProgramFromRaw;
exports.storeAllTVPrograms = storeAllTVPrograms;
exports.storeSingleTVProgram = storeSingleTVProgram;
