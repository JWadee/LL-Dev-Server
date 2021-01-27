var express = require('express');
const { json } = require('sequelize/types');
var router = express.Router();
let pool = require('../db/db');



function getAllLeagues(req, res){
  pool.getConnection(function(err, connection){
    if(err) {
      connection.release();
      res.json({"code": 100, "status": "Error in database connection"});
      return;
    }
    console.log("connected as id: " + connection.threadId);

    let sql = "SELECT * FROM leagues";

    connection.query(sql, function(err, rows) {
      connection.release();
      if(!err) {
        let leagues = [];
        rows.forEach(league => {
          leagues.push({
            intLeagueID : league.intLeagueID,
            intSportID : league.intSportID,
            jsonLeague : JSON.parse(league.jsonLeague)
          })
        });
        res.json(leagues)   
      }else{
        console.log(err)
      }
    });    
    
    connection.on('error', function(err){
      connection.release();
      res.json({"code": 100, "status": "Error in database connection"});
    })
  })
}

router.get('/', function(req, res) { 
  getAllLeagues(req, res);
});

module.exports = router;
