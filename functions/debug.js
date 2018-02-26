var tvProgramModel = require("./tvProgramModel");
var dateDebut = new Date("2018-02-22T22:19:00Z");
var d = new Date("2018-02-26T20:41:00+01:00");
console.log(d.toString());


tvProgramModel.getTVPrograms(dateDebut, "France 2", function(err, results){
  if(err) throw err;
  //console.log(results);
  tvProgramModel.closeConnection();
});
