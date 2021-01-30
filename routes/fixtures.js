var express = require('express');
var router = express.Router();
let pool = require('../db/db');
const settlePersonalBets = require('../utils/settleBets/settlePersonalBets');

function getContestFixturesByLeagues(req, res){
  pool.getConnection(function(err, connection){
    if(err) {
      connection.release();
      res.json({"code": 100, "status": "Error in database connection"});
      return;
    }
    console.log("connected as id: " + connection.threadId);
    //Retrieve fixtures

    let fixturesSQL = "SELECT * FROM fixtures WHERE intLeagueID IN (?) AND fixtures.dtmStart >= CAST(? AS DATETIME) AND fixtures.dtmStart <= CAST(? AS DATETIME) AND JSON_EXTRACT(jsonFixture, '$.time_status') IN ('0','1')";
    let leagueIDs = req.body.leagueIDs;
    let start = req.body.start;
    let end = req.body.end;
    let vals = [leagueIDs,start,end];

    console.log(fixturesSQL);

    connection.query(fixturesSQL, vals, function(err, rows) {
      if(!err) {
        //Filter fixtures into League fixtures object
        const fixtures = rows.map(fixture=>{
          //check for if League Fixtures object exists yet
          return (JSON.parse(fixture.jsonFixture))
        })

        //parse fixtures by league
        let leagueFixts = [];
        fixtures.forEach(fixture =>{
          let exists = leagueFixts.findIndex(league => league.leagueID === fixture.league.id)
          if(exists > -1){
            let tmp = leagueFixts[exists].fixtures;
            tmp.push(fixture)
            leagueFixts[exists].fixtures = tmp;
          }else{
            leagueFixts.push({
              leagueID: fixture.league.id, 
              fixtures:[fixture]
            })
          }
        })

        //Array to hold fixture IDs
        let fixtureIDs = [];
        
        //Get fixture ids to query odds 
        leagueFixts.forEach(league=>{
          league.fixtures.forEach(fixture=>{
            //add fixture id to array
            fixtureIDs.push(parseInt(fixture.id));
          });
        });

        //if any fixtures are returned fetch odds
        if(fixtureIDs.length > 0){
          //Retrieve odds for fixtures
          let oddsSQL = "SELECT * FROM fixture_odds WHERE intFixtureID IN (?)";

          connection.query(oddsSQL, [fixtureIDs], function(err, odds) {
            connection.release();
            if(!err) {
              //Need to parse so JSON is not getting double parsed
              const parsedOdds = odds.map(obj => {
                  const tmp = {}
                  tmp.oddsID = obj.intFixtureOddsID
                  tmp.fixtureID = obj.intFixtureID
                  tmp.odds = JSON.parse(obj.jsonOdds) // double-encoded field
                  return tmp;
              })

              //Add odds to fixtures objects
              leagueFixts.forEach(league=>{
                league.fixtures.forEach(fixture=>{
                  let index = parsedOdds.findIndex(odds => parseInt(odds.fixtureID) === parseInt(fixture.id));
                  if(index > -1){
                    fixture.oddsID = parsedOdds[index].oddsID
                    fixture.odds = parsedOdds[index].odds
                  }
                });
              });
              res.send(leagueFixts) 
            }else{
              console.log(err)
            }
          });
        }else{
          res.send(leagueFixts)
          connection.release();
        }
    
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

function updateResults(req,res) {
  pool.getConnection(function(err, connection){
      if(err) {
          connection.release();
          res.json({"code": 100, "status": "Error in database connection"});
          return;
      }else{
        //insert bet record
        let betSql ="UPDATE history_fixtures SET jsonFixture = JSON_INSERT(jsonFixture, '$.results', ?) WHERE intFixtureID = ?;"
        let betValues = [JSON.stringify(req.body.results), req.body.fixt_id];
        connection.query(betSql, betValues, function(err, result){
            if(err) {
              connection.release();
              res.json({"code": 400, "status": "Error creating new resource(s)"});
            }else{
              connection.release();  
              res.json({"code": 201, "status": "New resource(s) have been created"});
              settlePersonalBets(req.body.fixt_id, req.body.results);
            }
        });
      }



      connection.on('error', function(err){
          connection.release();
          res.json({"code": 100, "status": "Error in database connection"});
      })
  })
};

function getOddsByFixtures(req, res){
  pool.getConnection(function(err, connection){
    if(err) {
      connection.release();
      res.json({"code": 100, "status": "Error in database connection"});
      return;
    }
    console.log("connected as id: " + connection.threadId);

    let oddsSQL = "SELECT * FROM fixture_odds WHERE intFixtureID IN (?)";
    let fixtureIDs = req.body.fixtureIDs

    connection.query(oddsSQL, fixtureIDs, function(err, rows) {
      connection.release();
      if(!err) {
        //Need to parse so JSON is not getting double parsed
        const parsed = rows.map(obj => {
            const tmp = {}
            tmp.oddsID = obj.intFixtureOddsID
            tmp.fixtureID = obj.intFixtureID
            tmp.odds = JSON.parse(obj.jsonOdds) // double-encoded field
            return tmp;
        })
        res.send(parsed) 
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

function getFixtureByID(req, res){
  pool.getConnection(function(err, connection){
    if(err) {
      connection.release();
      res.json({"code": 100, "status": "Error in database connection"});
      return;
    }
    console.log("connected as id: " + connection.threadId);

    let sql = "SELECT * FROM fixtures WHERE intRefID = ?";
    let id = req.query.id

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

function getBook(req, res){
  pool.getConnection(function(err, connection){
    if(err) {
      connection.release();
      res.json({"code": 100, "status": "Error in database connection"});
      return;
    }
    console.log("connected as id: " + connection.threadId);

    let sql = "SELECT * FROM current_fixtures";

    connection.query(sql, function(err, rows) {
      connection.release();
      if(!err) {
        let formatted = [];
        rows.forEach(row=>{
          let obj = {
            fixture_id : row.intFixtureID,
            fixture : JSON.parse(row.jsonFixture)
          }
          formatted.push(obj);
        })
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

function getNeedResults(req, res){
  pool.getConnection(function(err, connection){
    if(err) {
      connection.release();
      res.json({"code": 100, "status": "Error in database connection"});
      return;
    }
    console.log("connected as id: " + connection.threadId);

    let sql = 'SELECT * FROM history_fixtures WHERE JSON_EXTRACT(jsonFixture, "$.results") IS NULL AND EXISTS '+
              '(SELECT * FROM personal_bets AS pb '+
              'INNER JOIN personal_bet_legs AS pbl ON pb.intBetID = pbl.intBetID '+
              'WHERE JSON_EXTRACT(jsonLeg, "$.fixture.fixtureID") = history_fixtures.intFixtureID)';

    connection.query(sql, function(err, rows) {
      connection.release();
      if(!err) {
        let formatted = [];
        rows.forEach(row=>{
          let obj = {
            fixture_id : row.intFixtureID,
            fixture : JSON.parse(row.jsonFixture)
          }
          formatted.push(obj);
        })
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
router.post('/byLeagues/withTimeFrame', function(req, res) { 
  getContestFixturesByLeagues(req, res);
});

router.post('/updateResults', function(req, res) { 
  updateResults(req, res);
});

router.post('/odds/byFixtures', function(req, res) { 
  getOddsByFixtures(req, res);
});

router.get('/byID', function(req, res) { 
  getFixtureByID(req, res);
});

router.get('/getBook', function(req, res) { 
  getBook(req, res);
});

router.get('/needResults', function(req, res) { 
  getNeedResults(req, res);
});

module.exports = router;
