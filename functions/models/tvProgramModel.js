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
    var toNightDate = new Date();
    var currentDate = new Date();
    toNightDate.setHours(22,00,00);//Lookout depends on the country and time zone
    if(currentDate.getTime() <= toNightDate.getTime()){
      startingTime = toNightDate;
    }else{
      startingTime = currentDate;
    }
    console.log(startingTime);
  }
  var request = tvProgramModel.find().where('startingTime').gte(startingTime);
  request = request.where('order').gte(0);
  if(channel){
    request = request.where('channel').equals(channel);
  }
  request = request.sort('channel startingTime');
  //request.exec(callback);
  request.exec((err, tvProgramToFilter) => {
    if(err) throw err;
    var previousTvProgram = null;
    var tvProgramToReturn = [];
    for(var tvProgram of tvProgramToFilter){
      if(!previousTvProgram || tvProgram.channel !== previousTvProgram.channel){
        previousTvProgram = tvProgram;
        tvProgramToReturn.push(tvProgram);
      }
    }
    callback(err, tvProgramToReturn);
  });
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

exports.storeSingleTVProgram = storeSingleTVProgram;
exports.getTVPrograms = getTVPrograms;
exports.getAllTVPrograms = getAllTVPrograms;
exports.closeConnection = closeConnection;
exports.getFrTvProgramOrder = getFrTvProgramOrder;
