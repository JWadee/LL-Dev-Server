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

    let sql = "SELECT bets.intContestBetID, bets.jsonBet, legs.jsonLeg, bets.strTimestamp  FROM contest_bets AS bets "+
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

function getPersonalBets(req, res){
  pool.getConnection(function(err, connection){
    if(err) {
      connection.release();
      res.json({"code": 100, "status": "Error in database connection"});
      return;
    }
    console.log("connected as id: " + connection.threadId);

    let sql = "SELECT bets.intBetID, bets.jsonBet, legs.jsonLeg  FROM personal_bets AS bets "+
              "INNER JOIN personal_bet_legs AS legs ON legs.intBetID = bets.intBetID "+
              "WHERE intAccountID = ?;";
    
    connection.query(sql, req.query.id, function(err, rows) {
      connection.release();
      if(!err) {
        let formatted = formatBets(rows) 
        console.log(formatted)
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

function createContestBets(req,res) {
    pool.getConnection(function(err, connection){
        if(err) {
            connection.release();
            res.json({"code": 100, "status": "Error in database connection"});
            return;
        }
        
        //get timestamp
        let timestamp = Date.now();
        let strTime = timestamp.toString()
        //run for each bet in array
        req.body.bets.forEach(bet => {
            //if bet type is straight insert records
            if(bet.jsonBet.type === "Straight"){
                //insert bet record
                let betSql ="INSERT INTO contest_bets (intContestPlayerID, jsonBet, strTimestamp) VALUES (?, ?, ?);";
                let betValues = [bet.contestPlayerID, JSON.stringify(bet.jsonBet), strTime];
                connection.query(betSql, betValues, function(err, result){
                    if(err) {
                      res.json({"code": 400, "status": "Error creating new resource(s)"});
                      connection.release();
                    }else{
                        //get bet id and insert bet leg record 
                        let betID = result.insertId
                        let legSql = "INSERT INTO contest_bet_legs (intBetID, jsonLeg) VALUES (?,?);";
                        let legValues = [betID, JSON.stringify(bet.leg)];
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

function createPersonalBets(req,res) {
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
              let betSql ="INSERT INTO personal_bets (intAccountID, jsonBet) VALUES (?, ?);";
              let betValues = [bet.account_id, JSON.stringify(bet.jsonBet)];
              connection.query(betSql, betValues, function(err, result){
                  if(err) {
                    res.json({"code": 400, "status": "Error creating new resource(s)"});
                    connection.release();
                  }else{
                      //get bet id and insert bet leg record 
                      let betID = result.insertId
                      let legSql = "INSERT INTO personal_bet_legs (intBetID, jsonLeg) VALUES (?,?);";
                      let legValues = [betID, JSON.stringify(bet.leg)];
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

router.get('/personal', function(req, res) { 
  getPersonalBets(req, res);
});

router.post('/createContest', function(req, res) { 
    createContestBets(req, res);
});

router.post('/createPersonal', function(req, res) { 
  createPersonalBets(req, res);
});

module.exports = router;
