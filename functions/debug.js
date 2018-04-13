var tvProgramModel = require("./models/tvProgramModel");
var startingTime = new Date("2018-03-31T19:50:00.000Z");
var settings = require("./config/settings");
//startingTime.setHours(22);

console.log(startingTime.toLocaleTimeString('fr-FR', { hour12: false, timeZone : 'Europe/Paris' }));

tvProgramModel.getTVPrograms(null, null, (err, results) => {
  if(err) throw err;
  console.log(results);
  //console.log(tvProgramModel.getFrTvProgramOrder(results[0].channel));
  tvProgramModel.closeConnection();
});
