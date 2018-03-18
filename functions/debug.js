var tvProgramModel = require("./models/tvProgramModel");
var startingTime = new Date();
var settings = require("./config/settings");


tvProgramModel.getTVPrograms(startingTime, "TF1", (err, results) => {
  if(err) throw err;
  console.log(results);
  //console.log(tvProgramModel.getFrTvProgramOrder(results[0].channel));
  tvProgramModel.closeConnection();
});

/*
tvProgramModel.getAllTVPrograms(function(err, results){
  if(err) throw err;
  console.log(results);
});
*/
