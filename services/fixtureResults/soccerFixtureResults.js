const cron = require("node-cron");
let pool = require('../../db/db');
/*
    Overview - service to check fixtures that don't have results in which the time
    Step 1: Fetch all contests where 
*/

//temporary single results
let results = 
    {

        id:86580234,

        sport_id:1,

        time:1582017300,

        time_status:1,

        league:{

            id:10046567,

            name:"Bangladesh Premier League"

        },

        home:{
            id:10447115,

            name:"Chittagong Abahani"

        },

        away:{

            id:10447115,

            name:"Arambagh KS"
        },

        o_away:{

            id:220325,

            name:"CA Platense",

            image_id:36837,

            cc:"ar"

        },

        ss:"0-1",

        timer:{

            tm:87,

            ts:52,

            tt:1,

            ta:0,

            md:1

        },

        scores:{

            1:{

                home:3,

                away:0

            },

            2:{

                home:3,

                away:2

            }

        },

        stats:{

            attacks:[

                131,

                116

            ],

            corners:[

                5,

                8

            ],

            corner_h:[

                0,

                4

            ],

            dangerous_attacks:[

                60,

                58

            ],

            goals:[

                3,

                2

            ],

            off_target:[

                8,

                3

            ],

            on_target:[

                5,

                5

            ],

            penalties:[

                0,

                1

            ],

            possession_rt:[

                48,

                52

            ],

            redcards:[

                0,

                0

            ],

            substitutions:[

                0,

                3

            ],

            yellowcards:[

                2,

                2

            ]

        },

        extra:{

            length:90,

            home_pos:2,

            away_pos:4,

            round:17

        },

        events:[

            {

                "id":62067608,

                "text":"1' - 1st Goal -   (Estudiantes Rio Cuarto) -"

            },

            {

                "id":"62067685",

                "text":"0:0 Corners 00:00 - 09:59"

            },

            {

                "id":"62067686",

                "text":"1:0 Goals 00:00 - 09:59"

            },

            {

                "id":"62067752",

                "text":"0:0 Corners 10:00 - 19:59"

            },

            {

                "id":"62067753",

                "text":"0:0 Goals 10:00 - 19:59"

            },

            {

                "id":"62067768",

                "text":"24' - 2nd Goal -   (Estudiantes Rio Cuarto) -"

            },

            {

                "id":"62067778",

                "text":"25' - 1st Corner - CA Platense"

            },

            {

                "id":"62067810",

                "text":"0:1 Corners 20:00 - 29:59"

            },

            {

                "id":"62067811",

                "text":"1:0 Goals 20:00 - 29:59"

            },

            {

                "id":"62067853",

                "text":"37' - 2nd Corner - CA Platense"

            },

            {

                "id":"62067857",

                "text":"37' - 3rd Corner - CA Platense"

            },

            {

                "id":"62067858",

                "text":"37' - Race to 3 Corners - CA Platense"

            },

            {

                "id":"62067864",

                "text":"38' - 4th Corner - CA Platense"

            },

            {

                "id":"62067878",

                "text":"0:3 Corners 30:00 - 39:59"

            },

            {

                "id":"62067879",

                "text":"0:0 Goals 30:00 - 39:59"

            },

            {

                "id":"62067882",

                "text":"41' - 1st Yellow Card -  (CA Platense)"

            },

            {

                "id":"62067924",

                "text":"45+2' - 3rd Goal -   (Estudiantes Rio Cuarto) -"

            },

            {

                "id":"62067931",

                "text":"Score After First Half - 3-0"

            },

            {

                "id":"62068048",

                "text":"50' - 4th Goal -   (CA Platense) -"

            },

            {

                "id":"62068049",

                "text":"0:0 Corners 40:00 - 49:59"

            },

            {

                "id":"62068050",

                "text":"1:1 Goals 40:00 - 49:59"

            },

            {

                "id":"62068063",

                "text":"53' - 5th Corner - Estudiantes Rio Cuarto"

            },

            {

                "id":"62068081",

                "text":"56' - 6th Corner - CA Platense"

            },

            {

                "id":"62068082",

                "text":"56' - Race to 5 Corners - CA Platense"

            },

            {

                "id":"62068104",

                "text":"59' - 7th Corner - Estudiantes Rio Cuarto"

            },

            {

                "id":"62068108",

                "text":"60' - 8th Corner - Estudiantes Rio Cuarto"

            },

            {

                "id":"62068114",

                "text":"3:1 Corners 50:00 - 59:59"

            },

            {

                "id":"62068115",

                "text":"0:0 Goals 50:00 - 59:59"

            },

            {

                "id":"62068130",

                "text":"64' - 2nd Yellow Card -  (Estudiantes Rio Cuarto)"

            },

            {

                "id":"62068135",

                "text":"64' - 5th Goal -   (CA Platense) -"

            },

            {

                "id":"62068144",

                "text":"67' - 9th Corner - CA Platense"

            },

            {

                "id":"62068160",

                "text":"0:1 Corners 60:00 - 69:59"

            },

            {

                "id":"62068161",

                "text":"0:1 Goals 60:00 - 69:59"

            },

            {

                "id":"62068162",

                "text":"71' - 3rd Yellow Card -  (CA Platense)"

            },

            {

                "id":"62068172",

                "text":"72' - 10th Corner - Estudiantes Rio Cuarto"

            },

            {

                "id":"62068185",

                "text":"74' - 11th Corner - Estudiantes Rio Cuarto"

            },

            {

                "id":"62068216",

                "text":"80' - 4th Yellow Card -  (Estudiantes Rio Cuarto)"

            },

            {

                "id":"62068220",

                "text":"2:0 Corners 70:00 - 79:59"

            },

            {

                "id":"62068221",

                "text":"0:0 Goals 70:00 - 79:59"

            },

            {

                "id":"62068248",

                "text":"85' - 12th Corner - CA Platense"

            },

            {

                "id":"62068249",

                "text":"85' - Race to 7 Corners - CA Platense"

            },

            {

                "id":"62068252",

                "text":"85' - 13th Corner - CA Platense"

            }

        ],

        has_lineup:0,

        inplay_created_at:1581983708,

        inplay_updated_at:1581991089,

        confirmed_at:1581982873

    };

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
                    console.log(row)
                    addResults()
                }else{
                    console.log('exists')
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
const checkFixtures = () => cron.schedule('*/1 * * * *', async () => {
    // checkForResults();
});

module.exports = checkFixtures;
