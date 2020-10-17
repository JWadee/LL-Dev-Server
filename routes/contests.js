var express = require('express');
var router = express.Router();
let pool = require('../db/db');



function createContest(req,res) {
  pool.getConnection(function(err, connection){
      if(err) {
          connection.release();
          res.json({"code": 100, "status": "Error in database connection"});
          return;
      }

      let sql ="INSERT INTO contests (strContestName, decEntryFee, decPrizePool, intContestTypeID, decInitialBankRoll, dtmStart, dtmEnd, intMinPlayers, intMaxPlayers, intContestStatusID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1);";

      let values = [req.body.name, req.body.entry, req.body.prizepool, req.body.typeID , req.body.bankroll, req.body.start, req.body.end, req.body.minPlayers, req.body.maxPlayers];

      connection.query(sql, values, function(err, result) {
          if(!err) {
            //Add contest league records
            let contestID = result.insertId;
            let values = '';
            //loop through leagues to build query
            req.body.leagueIDs.forEach((leagueID, idx, arr) => {
              //if first index and only id
              if(idx === 0 && arr.length === 1){
                values = "VALUES ("+leagueID+", "+contestID+");"
              //if first index and more than one id
              }else if(idx === 0){
                values = "VALUES ("+leagueID+", "+contestID+"), "
              //if last index
              }else if(idx === arr.length - 1){
                values = values+"("+leagueID+", "+contestID+");"
              //if neither first or last index
              }else{
                values = values+"("+leagueID+", "+contestID+"), "
              }
            });

            let sql = "INSERT INTO contest_leagues (intLeagueID, intContestID) "+values;
            
            connection.query(sql, function(err, result) {
              connection.release();
              if(!err) {
                res.json("success");
              }else{
                console.log(err)
              }
            });
          }else{
            console.log(err);
            connection.release();
          } 
      });    

      connection.on('error', function(err){
          connection.release();
          res.json({"code": 100, "status": "Error in database connection"});
      })
  })
};

function enterContest(req,res) {
  pool.getConnection(function (err, connection) {
    if (err) {
        connection.release();
        res.json({ "code": 100, "status": "Error in database connection" });
        return;
    }
    console.log("connected as id: " + connection.threadId);

    let sql = "INSERT INTO contest_players (intAccountID, intContestID) VALUES (?,?)";
    let values = [req.body.accountID, req.body.contestID];

    connection.query(sql, values, function (err, result){
        connection.release();
        if (!err) {
            res.json({ "code": 200, "status":"Success" });
        }
        console.log(err);
    });
    connection.on('error', function (err) {
        res.json({ "code": 100, "status": "Error in database connection" });
    })
})
};

function getOpenContests(req, res){
  pool.getConnection(function(err, connection){
    if(err) {
      connection.release();
      res.json({"code": 100, "status": "Error in database connection"});
      return;
    }
    console.log("connected as id: " + connection.threadId);

    let sql = "SELECT c.*, l.strLeagueName, cl.intLeagueID, ct.strContestType FROM contests AS c "+
              "INNER JOIN contest_types AS ct ON ct.intContestTypeID = c.intContestTypeID "+
              "INNER JOIN contest_leagues AS cl ON cl.intContestID = c.intContestID "+
              "INNER JOIN leagues AS l on l.intLeagueID = cl.intLeagueID "+
              "WHERE c.intContestStatusID = 1";

    connection.query(sql, function(err, rows) {
      connection.release();
      if(!err) {
        res.json(rows);   
      }else{
        console.log(err);
      }
    });    
    
    connection.on('error', function(err){
      connection.release();
      res.json({"code": 100, "status": "Error in database connection"});
    })
  })
}

function getMyContests(req, res){
  pool.getConnection(function(err, connection){
    if(err) {
      connection.release();
      res.json({"code": 100, "status": "Error in database connection"});
      return;
    }
    console.log("connected as id: " + connection.threadId);

    let sql = "SELECT  c.*, ct.strContestType, cp.intContestPlayerID FROM contests AS c "+ 
              "INNER JOIN contest_players AS cp ON cp.intContestID = c.intContestID "+ 
              "INNER JOIN contest_types AS ct ON ct.intContestTypeID = c.intContestTypeID "+
              "WHERE cp.intAccountID = ?"; 
    
    let ID = req.query.ID;           

    connection.query(sql, ID, function(err, row) {
      connection.release();
      if(!err) {
        res.json(row)   
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


function getTypes(req, res){
  pool.getConnection(function(err, connection){
    if(err) {      
      console.log(err)
      connection.release();
      res.json({"code": 100, "status": "Error in database connection"});
      return;
    }
    console.log("connected as id: " + connection.threadId);

    let sql = "SELECT * FROM contest_types";

    connection.query(sql, function(err, row) {
      connection.release();
      if(!err) {
        res.json(row)   
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

function getByID(req, res){
  pool.getConnection(function(err, connection){
    if(err) {      
      console.log(err)
      connection.release();
      res.json({"code": 100, "status": "Error in database connection"});
      return;
    }
    console.log("connected as id: " + connection.threadId);

    let sql = "SELECT c.* FROM contests AS c WHERE c.intContestID = ?;";
    let id = req.query.id;
    connection.query(sql, id, function(err, row) {
      connection.release();
      if(!err) {
        res.json(row[0])   
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

function getContestLeaguesByID(req, res){
  pool.getConnection(function(err, connection){
    if(err) {      
      console.log(err)
      connection.release();
      res.json({"code": 100, "status": "Error in database connection"});
      return;
    }
    console.log("connected as id: " + connection.threadId);

    let sql = "SELECT cl.intLeagueID, l.strLeagueName FROM contest_leagues AS cl "+
              "INNER JOIN leagues as l ON cl.intLeagueID = l.intLeagueID "+
              "WHERE cl.intContestID = ?;";
              
    let id = req.query.id;
    connection.query(sql, id, function(err, row) {
      connection.release();
      if(!err) {
        res.json(row)   
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

router.post('/create', function(req, res) { 
  createContest(req, res);
});

router.post('/enter', function(req, res) { 
  enterContest(req, res);
});

router.get('/open', function(req, res) { 
  getOpenContests(req, res);
});

router.get('/myContests', function(req, res) { 
  getMyContests(req, res);
});

router.get('/types', function(req, res) { 
  getTypes(req, res);
});

router.get('/byID', function(req, res) { 
  getByID(req, res);
});

router.get('/contestLeagues/byID', function(req, res) { 
  getContestLeaguesByID(req, res);
});


module.exports = router;
