var tvProgramModel = require("./tvProgramModel");
var dateDebut = new Date();
console.log(dateDebut);

/*
tvProgramModel.getAllTVPrograms(function(err, results){
  if(err) throw err;
  console.log(results);
});
*/

tvProgramModel.getTVPrograms(dateDebut, null, function(err, results){
  if(err) throw err;
  console.log(results);
  tvProgramModel.closeConnection();
});
