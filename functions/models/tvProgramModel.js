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

  var request = tvProgramModel.find().where('startingTime').lte(startingTime);
  request = request.where("endingTime").gt(startingTime);
  request = request.where('order').gte(0);
  if(channel || channel !== ""){
    request = request.where('channel').equals(channel);
  }
  request = request.sort('order');
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
    console.log(raw);
    if(raw.channel === channel)
      return raw.order;
  }
  return -1;
};

var renderFulfillmentResponse = function(tvPrograms){

  var simpleResponse = {
    'ssml': "<speak>",
    'display_text' : ""
  };
  for(var tvProgram of tvPrograms){
    simpleResponse.ssml += 'Sur ' + tvProgram.channel + " à " + tvProgram.startingTime.getHours() + " heures "+ tvProgram.startingTime.getMinutes()+ " il y a " + tvProgram.programName + " <break time=\"1\" />",
    simpleResponse.display_text += 'Sur ' + tvProgram.channel + " à " + tvProgram.startingTime.getHours() + " heures "+ tvProgram.startingTime.getMinutes()+ " il y a " + tvProgram.programName
  }
  simpleResponse.ssml += "</speak>";
  var cardToReturn = {
    'platform': 'ACTIONS_ON_GOOGLE',
    'simple_responses' : {
      'simple_responses' : [simpleResponse]
    }
  };
  return [cardToReturn];
}

exports.storeSingleTVProgram = storeSingleTVProgram;
exports.getTVPrograms = getTVPrograms;
exports.getAllTVPrograms = getAllTVPrograms;
exports.closeConnection = closeConnection;
exports.getFrTvProgramOrder = getFrTvProgramOrder;
exports.renderFulfillmentResponse = renderFulfillmentResponse;
