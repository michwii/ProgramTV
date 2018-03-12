var tvProgramModel = require("./models/tvProgramModel");
var startingTime;
var settings = require("./config/settings");

if(!startingTime){
  var toNightDate = new Date();
  var currentDate = new Date();
  toNightDate.setHours(21 + settings.getLocalTimeOffset('FR'),0,0);//Lookout depends on the country and time zone
  if(currentDate.getTime() <= toNightDate.getTime()){
    startingTime = toNightDate;
  }else{
    startingTime = currentDate;
  }
  console.log(startingTime);
}
/*
tvProgramModel.getTVPrograms(null, "Canal+", (err, results) => {
  if(err) throw err;
  console.log(results);
  console.log(tvProgramModel.getFrTvProgramOrder(results[0].channel));
  tvProgramModel.closeConnection();
});
*/
