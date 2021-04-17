const cron = require("node-cron");
let pool = require('../../db/db');

//Function to check if fixture has results
const checkForResults = () => {
    pool.getConnection(function(err, connection){
        if(err) {
            connection.release();
            return ({"code": 100, "status": "Error in database connection"});
        }
        console.log("connected as id: " + connection.threadId);
    
        let sql = "SELECT * FROM fixtures WHERE jsonResults IS NOT NULL AND intRefID = ?;"; 
    
        connection.query(sql, results.id, function(err, row) {
            connection.release();
            if(err) {
                console.log(err);
            }else{
                if(row.length < 1){
                    addResults()
                }else{
                }
            }
        });    
        
        connection.on('error', function(err){
            connection.release();
            return ({"code": 100, "status": "Error in database connection"});
        })
    })
}

//Function to update record to add the results -> Then fetch bets and legs for fixture
const addResults = () => {
    pool.getConnection(function(err, connection){
        if(err) {
            connection.release();
            return ({"code": 100, "status": "Error in database connection"});
        }
        console.log("connected as id: " + connection.threadId);
    
        let vars = [JSON.stringify(results), results.id]
        let sql = "UPDATE fixtures SET jsonResults = ? WHERE intRefID = ?;";
    
        connection.query(sql, vars, function(err, rows) {
            connection.release();
            if(err) {
                console.log(err);
            }else{
                getLegsAndBetsByFixture(results.id)
            }
        });    
        
        connection.on('error', function(err){
            connection.release();
            return ({"code": 100, "status": "Error in database connection"});
        })
      })
}
//Function to get bet legs by fixture id, format the legs, and send them to be settled
function getLegsAndBetsByFixture(id){
    pool.getConnection(function(err, connection){
        if(err) {
            connection.release();
            res.json({"code": 100, "status": "Error in database connection"});
            return;
        }
        console.log("connected as id: " + connection.threadId);
  
        let sql = "SELECT legs.intLegID, legs.intBetID, legs.jsonLeg, bets.jsonBet FROM contest_bet_legs AS legs "+
                  "INNER JOIN contest_bets AS bets ON bets.intContestBetID = legs.intBetID "+ 
                  "WHERE intFixtureRefID = ?;";
            
        connection.query(sql, id, function(err, rows) {
            connection.release();
            if(!err) {
                let legs = [];
                rows.forEach(row=>{
                    let leg = {
                        legID : row.intLegID,
                        betID : row.intBetID,
                        leg : JSON.parse(row.jsonLeg),
                        bet : JSON.parse(row.jsonBet)
                    }
                    legs.push(leg);
                })
                settleBets(legs);
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


//Function to settle bets after results have been added to fixture  
const settleBets = (legs) => {
    legs.forEach(leg=>{
        //get the home and away scores
        let ss = results.ss.split("-");
        let homeScore = ss[0];
        let awayScore = ss[1];
        let result;

        //settle spread bet
        if(leg.leg.line.type === "Spread"){
            let spread = leg.leg.line.line;
            if(leg.leg.line.team.type === "Home"){
                if(homeScore + spread > awayScore){
                    result = "W";                 
                }else if(homeScore + spread === awayScore){
                    result = "P";
                }else if(homeScore + spread < awayScore){
                    result = "L";
                }
            }else if(leg.leg.line.team.type === "Away"){
                if(awayScore + spread > homeScore){
                    result = "W";                 
                }else if(awayScore + spread === homeScore){
                    result = "P";
                }else if(awayScore + spread < homeScore){
                    result = "L";
                }
            }
        //settle moneyline bet
        }else if(leg.leg.line.type === "Moneyline"){
            let type = leg.leg.line.team.type;
            if(type === "Home"){
                if(homeScore > awayScore){
                    result = "W";                
                }else{
                    result = "L";                 
                }
            }else if(type === "Away"){
                if(awayScore > homeScore){
                    result = "W";                 
                }else{
                    result = "L";                 
                }
            }else if(type === "Draw"){
                if(awayScore === homeScore){
                    result = "W";                 
                }else{
                    result = "L";                 
                }
            }
        //settle total bet
        }else if(leg.leg.line.type === "Total"){
            if(leg.leg.line.bet === "Over"){
                if(homeScore + awayScore > leg.leg.line.line){
                    result = "W";                 
                }else if(homeScore + awayScore < leg.leg.line.line){
                    result = "L";                 
                }else if(homeScore + awayScore === leg.leg.line.line){
                    result = "P";                 
                }
            }else if(leg.leg.line.bet === "Under"){
                if(homeScore + awayScore < leg.leg.line.line){
                    result = "W";                 
                }else if(homeScore + awayScore > leg.leg.line.line){
                    result = "L";                 
                }else if(homeScore + awayScore === leg.leg.line.line){
                    result = "P";                 
                }
            }
        }

        //*********NOT SET UP TO HANDLE PARLAYS YET */
        //Add result to leg and bet objects to be stored in database
        leg.leg.result = result;
        leg.bet.result = result;

        updateBetRecords(leg);
        updateLegRecords(leg);
    })
}

//Function to update records in database for leg and bet results
const updateBetRecords = (leg) => {
    pool.getConnection(function(err, connection){
        if(err) {
            connection.release();
            return ({"code": 100, "status": "Error in database connection"});
        }
        console.log("connected as id: " + connection.threadId);

        let sql = "UPDATE contest_bets SET jsonBet = JSON_SET(jsonBet, '$.result', ?) WHERE intContestBetID = ?;";

        let vars = [leg.bet.result, leg.betID]

        // Update Leg json to include result and Bet json to include result 
        connection.query(sql, vars, function(err, row) {
            connection.release();
            if(err) {
                console.log(err);
            }
        });    

        connection.on('error', function(err){
            connection.release();
            return ({"code": 100, "status": "Error in database connection"});
        })
    })
}

const updateLegRecords = (leg) => {
    pool.getConnection(function(err, connection){
        if(err) {
            connection.release();
            return ({"code": 100, "status": "Error in database connection"});
        }
        console.log("connected as id: " + connection.threadId);

        let sql = "UPDATE contest_bet_legs SET jsonLeg = JSON_SET(jsonLeg, '$.result', ?) WHERE intLegID = ?; ";

        let vars = [leg.leg.result, leg.legID];

        // Update Leg json to include result and Bet json to include result 
        connection.query(sql, vars, function(err, row) {
            connection.release();
            if(err) {
                console.log(err);
            }
        });    

        connection.on('error', function(err){
            connection.release();
            return ({"code": 100, "status": "Error in database connection"});
        })
    });
}

//Export Cron job to fixtures and add results
// const checkFixtures = () => cron.schedule('*/1 * * * *', async () => {
//     // checkForResults();
// });

module.exports = checkFixtures;
