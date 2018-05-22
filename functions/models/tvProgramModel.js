const mongoose = require('mongoose');
var tvProgramOrder = require('./../config/tvProgramOrder');
var functions;

var connectionString;

if(process.env.env === "dev"){ // We are running the code on my local computer
  connectionString = process.env['db.connection_string'];
}else{ //We are running the code on Google Cloud Function
  functions = require('firebase-functions');
  connectionString = functions.config().db.connection_string;
}

mongoose.connect(connectionString);

var Schema = mongoose.Schema;

var tvProgramSchema = new Schema({
  link: String,
  category: String,
  description: String,
  channel: String,
  startingTime: Date,
  programName: String,
  rating: String,
  endingTime: Date,
  order : Number
});

var tvProgramModel = mongoose.model('fr-tv-program', tvProgramSchema);

var storeSingleTVProgram = (data, callback) => {
  var tvProgramToSave = new tvProgramModel(data);
  tvProgramToSave.save(callback);
};

var getTVPrograms = (startingTime, channel, callback) => {

  if(!startingTime){
    startingTime = new Date();
    startingTime.setUTCHours(19);
  }

  var request = tvProgramModel.find().where('startingTime').lte(startingTime);
  request = request.where("endingTime").gt(startingTime);
  request = request.where('order').gte(0);
  if(channel && channel !== ""){
    request = request.where('channel').equals(channel);
  }
  request = request.sort('order');
  request = request.limit(9);
  request.exec(callback);

};
var getAllTVPrograms = (callback) => {
  var request = tvProgramModel.find().where('order').gte(0);
  request.exec(callback);
};

var closeConnection = () => {
  mongoose.connection.close();
};

var getFrTvProgramOrder = (channel) => {
  for(var raw of tvProgramOrder.frTvProgramOrder){
    if(raw.channel === channel)
      return raw.order;
  }
  return -1;
};

var renderFulfillmentResponse = function(tvPrograms){

  var responseToSend;
  var richResponse;
  //We fill up the following variables now whatever the response we will give
  var simpleResponse = {
    'ssml': "<speak>",
    'display_text' : "Voici le programme TV"
  };
  var simpleResponses = {
    'platform': 'ACTIONS_ON_GOOGLE',
    'simple_responses' : {
      'simple_responses' : [simpleResponse]
    }
  };

  if(tvPrograms.length > 1){
    var formattedText = "";
    for(var tvProgram of tvPrograms){
      simpleResponse.ssml += 'Sur ' + tvProgram.channel + " : " + tvProgram.programName + " <break time=\"1\" />";
      formattedText += "  **" + tvProgram.channel + "** à " + tvProgram.startingTime.toLocaleTimeString('fr-FR', { hour12: false, timeZone : 'Europe/Paris' }) + " : " + tvProgram.programName + ".  "; // Doble space = new line
    }

    richResponse = {
      "platform": "ACTIONS_ON_GOOGLE",
      "basicCard": {
        "title": "Programme TV",
        "subtitle": "Ce soir",
        "formattedText": formattedText
      }
    }
    responseToSend = [simpleResponses, richResponse];
  }else if (tvPrograms.length === 1){
    tvPrograms = tvPrograms[0];
    simpleResponse.ssml += 'Sur ' + tvPrograms.channel + " à " + tvPrograms.startingTime.toLocaleTimeString('fr-FR', { hour12: false })+ " il y a " + tvPrograms.programName ;
    richResponse = {
      "platform": "ACTIONS_ON_GOOGLE",
      "basicCard": {
        "title": tvPrograms.channel,
        "subtitle": tvPrograms.startingTime.toLocaleTimeString('fr-FR', { hour12: false, timeZone : 'Europe/Paris'}),
        "formattedText": tvPrograms.programName
      }
    }
    responseToSend = [simpleResponses, richResponse];
  }else{
    simpleResponse.ssml += "Désolé mais je n'ai rien trouvé de pertinant. Peut-être qu'il est préférable que vous sortiez plutôt que de rester sur votre canapé";
    simpleResponse.display_text = "Pas de programme TV";
    responseToSend = [simpleResponses];
  }
  simpleResponse.ssml += "</speak>";

  return responseToSend;
}

exports.storeSingleTVProgram = storeSingleTVProgram;
exports.getTVPrograms = getTVPrograms;
exports.getAllTVPrograms = getAllTVPrograms;
exports.closeConnection = closeConnection;
exports.getFrTvProgramOrder = getFrTvProgramOrder;
exports.renderFulfillmentResponse = renderFulfillmentResponse;
