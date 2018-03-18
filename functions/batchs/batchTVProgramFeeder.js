const functions = require('firebase-functions');
var request = require('request');
var async = require('async');
var tvProgramModel = require("./../models/tvProgramModel");
var parseDuration = require('parse-duration');

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

exports.runBatch = runBatch;
