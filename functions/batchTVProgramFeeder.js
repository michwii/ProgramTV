const functions = require('firebase-functions');
var request = require('request');
var parseString = require('xml2js').parseString;
var async = require('async');
var tvProgramModel = require("./tvProgramModel");

var runBatch = (callback) => {
  var currentDate = new Date();
  var stringDaysForRSSRequest = (currentDate.getDate() < 10 ? '0' : '') + currentDate.getDate() + '-' + (currentDate.getMonth() < 10 ? '0' : '') + (currentDate.getMonth() + 1) + '-' + currentDate.getFullYear();
  var url = "https://webnext.fr/epg_cache/programme-tv-rss_"+ stringDaysForRSSRequest +".xml";
  getRawTVProgram(url, function(err, rawTVProgram){
    if(err) throw err;
    var cleanTVprogram = extractTVProgramFromRaw(rawTVProgram);
    storeAllTVPrograms(cleanTVprogram, function(err, results){
      if(err) throw err;
      tvProgramModel.closeConnection();
      callback(err, null);
    });
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
    //We create a dateString in full format in order to add at the end of the constructor the GMT time zone.
    var monthInTwoDigits = (currentDate.getMonth()+1 < 10) ? "0" + (currentDate.getMonth()+1) : (currentDate.getMonth()+1);
    var dateInTwoDigits = (currentDate.getDate() < 10) ? "0" + currentDate.getDate() : currentDate.getDate();
    var dateStringFullFormat = currentDate.getFullYear() + "-" + monthInTwoDigits + "-" + dateInTwoDigits + "T" + hourProgram.substring(0,2) + ":" + hourProgram.substring(3,5) +":00+01:00";
    tvProgram.startingTime = new Date(dateStringFullFormat);

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
    allRequests.push(tvProgramModel.storeSingleTVProgram.bind(null, tvProgram));
  }
  async.parallelLimit(allRequests, 20, function(err, results){
    if(err) throw err;
    callback(err, results);
  });
};

exports.runBatch = runBatch;
exports.getRawTVProgram  = getRawTVProgram ;
exports.extractTVProgramFromRaw = extractTVProgramFromRaw;
exports.storeAllTVPrograms = storeAllTVPrograms;
