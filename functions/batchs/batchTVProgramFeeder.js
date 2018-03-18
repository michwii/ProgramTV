const functions = require('firebase-functions');
var request = require('request');
var parseString = require('xml2js').parseString;
var async = require('async');
var tvProgramModel = require("./../models/tvProgramModel");
var parseDuration = require('parse-duration');

/*
var runBatch = (callback) => {
  var currentDate = new Date();
  var stringDaysForRSSRequest = (currentDate.getDate() < 10 ? '0' : '') + currentDate.getDate() + '-' + (currentDate.getMonth() < 10 ? '0' : '') + (currentDate.getMonth() + 1) + '-' + currentDate.getFullYear();
  var url = "https://webnext.fr/epg_cache/programme-tv-rss_"+ stringDaysForRSSRequest +".xml";
  getRawTVProgram(url, (err, rawTVProgram) =>{
    if(err) throw err;
    var cleanTVprogram = extractTVProgramFromRaw(rawTVProgram);
    storeAllTVPrograms(cleanTVprogram, (err, results) => {
      if(err) throw err;
      tvProgramModel.closeConnection();
      callback(err, null);
    });
  });
}
*/

var runBatch = (callback) => {
  request.get("https://api.apify.com/v1/JaAkykk8uie6pPv5D/crawlers/zMLHPGt3TAzMeZiqN/lastExec/results?token=KPdqcEt88r6fQgettTzFxtPqz", (err, response, body) => {
    if(err) throw err;
    var apiResult = JSON.parse(body)[0];
    var channels = apiResult.pageFunctionResult.channel;
    var programNames = apiResult.pageFunctionResult.programName;
    var startingTimes = apiResult.pageFunctionResult.startingTime;
    var categories = apiResult.pageFunctionResult.category;
    var durations = apiResult.pageFunctionResult.duration;
    var tvPrograms = [];
    for(var i = 0; i < channels.length; i++){
      //Because the librairy can parse only min results
      durations[i] = durations[i].replace('mn', 'min');
      //Because the results will be in seconds.
      durations[i] = parseDuration(durations[i]);

      var channel = channels[i].replace("Programme","");

      var currentDate = new Date();
      var hourProgram = startingTimes[i];
      //We create a dateString in full format in order to add at the end of the constructor the GMT time zone.
      var monthInTwoDigits = (currentDate.getMonth()+1 < 10) ? "0" + (currentDate.getMonth()+1) : (currentDate.getMonth()+1);
      var dateInTwoDigits = (currentDate.getDate() < 10) ? "0" + currentDate.getDate() : currentDate.getDate();
      var dateStringFullFormat = currentDate.getFullYear() + "-" + monthInTwoDigits + "-" + dateInTwoDigits + "T" + hourProgram.substring(0,2) + ":" + hourProgram.substring(3,5) +":00+01:00";
      var startingTime = new Date(dateStringFullFormat);
      var endingTime = new Date(startingTime.getTime()+durations[i]);

      var tvProgram = {
        channel : channel,
        programName : programNames[i],
        startingTime : startingTime,
        endingTime : endingTime,
        category : categories[i],
        order : i
      }

      tvPrograms.push(tvProgram);
    }
    async.mapLimit(tvPrograms, 10, tvProgramModel.storeSingleTVProgram, (err, results) => {
      if(err) throw err;
      tvProgramModel.closeConnection();
      callback(err, results);
    });
  });
}


/*
var getRawTVProgram = (url, callback) => {
  request.get(url, (err, response, body) => {
    if(err) throw err;
    parseString(body, (err, result) => {
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

    //We add the order of the channel in order to present them to the user in order.
    tvProgram.order = tvProgramModel.getFrTvProgramOrder(tvProgram.channel);

    previousProgram = tvProgram;
  }
  return rawTVProgram;
};

var storeAllTVPrograms = (allTVProgram, callback) => {
  var allRequests = [];
  for(var tvProgram of allTVProgram){
    allRequests.push(tvProgramModel.storeSingleTVProgram.bind(null, tvProgram));
  }
  async.parallelLimit(allRequests, 20, (err, results) => {
    if(err) throw err;
    callback(err, results);
  });
};
*/
exports.runBatch = runBatch;
//exports.getRawTVProgram  = getRawTVProgram ;
//exports.extractTVProgramFromRaw = extractTVProgramFromRaw;
//exports.storeAllTVPrograms = storeAllTVPrograms;
