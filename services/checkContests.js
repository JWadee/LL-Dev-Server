const cron = require("node-cron");
let pool = require('../db/db');

// Step 3 Function to update contests to live or history
const updateContests = (contests, statusID) => {
  pool.getConnection(function(err, connection){
    if(err) {
      connection.release();
      return ({"code": 100, "status": "Error in database connection"});
    }
    console.log("connected as id: " + connection.threadId);

    let vars = [statusID, contests]
    let sql = "UPDATE contests SET intContestStatusID = ? WHERE intContestID IN (?);";

    connection.query(sql, vars, function(err, rows) {
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



/* Step 2 -  Function to organize contests needing to be updated to live, or completed
    -- Called after getContestTimes runs
*/
const organizeContests = (contests) =>{
  let live = [];
  let history = [];
  contests.forEach(contest => {

    if(contest.intContestStatusID === 1 && new Date() > contest.dtmStart){
      live.push(contest.intContestID)
    }else if(contest.intContestStatusID === 2 && new Date() > contest.dtmEnd){
      history.push(contest.intContestID)
    }
  });

  //update live
  if(live.length > 0){
    updateContests(live, 2)
  }
    //update history
  if(history.length > 0){
    updateContests(history, 3)
  }
}

//Step 1 - Function to query contest time, statuses, and ids from database
function getContestTimes(){
    pool.getConnection(function(err, connection){
      if(err) {
        connection.release();
        return ({"code": 100, "status": "Error in database connection"});
      }
      console.log("connected as id: " + connection.threadId);
  
      let sql = "SELECT c.intContestID, c.dtmStart, c.dtmEnd, c.intContestStatusID FROM contests AS c;";
              
      connection.query(sql, function(err, rows) {
        connection.release();
        if(!err) {
          organizeContests(rows);
          return;
        }else{
          console.log(err);
          return;
        }
      });    
      
      connection.on('error', function(err){
        connection.release();
        return ({"code": 100, "status": "Error in database connection"});
      })
    })
}


//Export Cron job to check and update contest statuses
const checkContests = () => cron.schedule('*/15 * * * *', async () => {
    getContestTimes();
});

module.exports = checkContests;
