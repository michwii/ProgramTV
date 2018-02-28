var tvProgramModel = require("./models/tvProgramModel");
var dateDebut = new Date();
dateDebut.setHours(20);
console.log(dateDebut);

/*
tvProgramModel.getAllTVPrograms(function(err, results){
  if(err) throw err;
  console.log(results);
});
*/

tvProgramModel.getTVPrograms(null, "Canal+", (err, results) => {
  if(err) throw err;
  console.log(results);
  console.log(tvProgramModel.getFrTvProgramOrder(results[0].channel));
  tvProgramModel.closeConnection();
});
