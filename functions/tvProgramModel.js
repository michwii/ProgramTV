const mongoose = require('mongoose');
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
  endingTime: Date
});

var tvProgramModel = mongoose.model('fr-tv-program', tvProgramSchema);

var storeSingleTVProgram = (data, callback) => {
  var tvProgramToSave = new tvProgramModel(data);
  tvProgramToSave.save(callback);
};

var getTVPrograms = (startingTime, channel, callback) => {
  var request = tvProgramModel.find().where('startingTime').gte(startingTime);
  //request = request.where('channel').ne("");
  if(channel){
    request = request.where('channel').equals(channel);
  }
  request.exec(callback);
};
var getAllTVPrograms = (callback) => {
  var request = tvProgramModel.find();
  request.exec(callback);
};

var closeConnection = () => {
  mongoose.connection.close();
};

exports.storeSingleTVProgram = storeSingleTVProgram;
exports.getTVPrograms = getTVPrograms;
exports.getAllTVPrograms = getAllTVPrograms;
exports.closeConnection = closeConnection;
