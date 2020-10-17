var express = require('express');
var router = express.Router();
let pool = require('../db/db');
const formatBets = require('../functions/formatBets');

function getBetsByEntry(req, res){
  pool.getConnection(function(err, connection){
    if(err) {
      connection.release();
      res.json({"code": 100, "status": "Error in database connection"});
      return;
    }
    console.log("connected as id: " + connection.threadId);

    let sql = "SELECT bets.intContestBetID, bets.jsonBet, legs.jsonLeg  FROM contest_bets AS bets "+
              "INNER JOIN contest_bet_legs AS legs ON legs.intBetID = bets.intContestBetID "+
              "WHERE intContestPlayerID = ?;";
    
    connection.query(sql, req.query.entryid, function(err, rows) {
      connection.release();
      if(!err) {
        let formatted = formatBets(rows) 
        res.json(formatted)  
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

function createBets(req,res) {
    pool.getConnection(function(err, connection){
        if(err) {
            connection.release();
            res.json({"code": 100, "status": "Error in database connection"});
            return;
        }
        //run for each bet in array
        req.body.bets.forEach(bet => {
            //if bet type is straight insert records
            if(bet.jsonBet.type === "Straight"){
                //insert bet record
                let betSql ="INSERT INTO contest_bets (intContestPlayerID, jsonBet) VALUES (?, ?);";
                let betValues = [bet.contestPlayerID, JSON.stringify(bet.jsonBet)];
                connection.query(betSql, betValues, function(err, result){
                    if(err) {
                      res.json({"code": 400, "status": "Error creating new resource(s)"});
                      connection.release();
                    }else{
                        //get bet id and insert bet leg record 
                        let betID = result.insertId
                        let legSql = "INSERT INTO contest_bet_legs (intBetID, intFixtureRefID, jsonLeg) VALUES (?,?,?);";
                        let legValues = [betID, bet.leg.fixture.fixtureID,  JSON.stringify(bet.leg)];
                        connection.query(legSql, legValues, function(err, result){
                            if(err){
                              res.json({"code": 400, "status": "Error creating new resource(s)"});
                              connection.release();
                            }
                        });
                    }
                });
            }
        });

        connection.release();  
        res.json({"code": 201, "status": "New resource(s) have been created"});

        connection.on('error', function(err){
            connection.release();
            res.json({"code": 100, "status": "Error in database connection"});
        })
    })
};

router.get('/byEntry', function(req, res) { 
  getBetsByEntry(req, res);
});


router.post('/create', function(req, res) { 
    createBets(req, res);
});
  

module.exports = router;
