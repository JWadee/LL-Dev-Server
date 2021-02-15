const cron = require("node-cron");
let pool = require('../db/db');
const { Sequelize, DataTypes, Model} = require('sequelize');
const getLeaderboards = require('../functions/getLeaderboards');


//Initialize Sequelize
const sequelize = new Sequelize('Lineleaders', 'admin', 'LLsredael321?', {
  host: '162.249.2.42',
  dialect: 'mysql'
});


//Function to update live contests
const updateLiveContests = (contestIDs) => {
  let sql = "UPDATE contests SET intContestStatusID = 2 WHERE intContestID IN ("+contestIDs+");";
  sequelize.query(sql);
}


//Function to update history contests, placements, and winnings
const updateHistoryContests = async(contests) => {
  let contestIDs = [];
  for (const contest of contests) {    
    //add contest id to array for updated contest status
    contestIDs.push(contest.intContestID)
    //fetch leaderboard for contest
    let leaderboards = await getLeaderboards(contest.intContestID, contest.intContestTypeID, contest.decPrizePool);
    //for each entry, update placement and winnings
    leaderboards.forEach(entry => {
      let record ="";
      if(entry.p > 0){
        record = entry.w +"-"+ entry.l +"-"+ entry.p
      }else{
        record = entry.w +"-"+ entry.l
      }
      let entrySql = "UPDATE contest_players SET intPlacement = "+entry.place+" ,decWinnings = "+entry.winnings+" ,strRecord = "+record+" ,decBankroll = "+entry.bankroll+" WHERE intContestPlayerID ="+entry.id+";";
      sequelize.query(entrySql);
    })
  };

  //update contestes to history
  let contestSql = "UPDATE contests SET intContestStatusID = 3 WHERE intContestID IN ("+contestIDs+");";
  sequelize.query(contestSql);
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
      history.push(contest)
    }
  });

  //update live
  if(live.length > 0){
    updateLiveContests(live)
  }
  //update history and update winnings and placements
  if(history.length > 0){
    updateHistoryContests(history)
  }
}

//Step 1 - Function to query contest time, statuses, and ids from database
async function getContestTimes(){
  let sql = "SELECT c.intContestID, c.dtmStart, c.dtmEnd, c.intContestStatusID, c.decPrizePool, c.intContestTypeID FROM contests AS c;";
  //ignore metadata (it is automatically returned by sequelize - same thing as rows)
  const [rows, metaData] = await sequelize.query(sql);
  organizeContests(rows);
}


//Export Cron job to check and update contest statuses
const checkContests = () => cron.schedule('*/15 * * * *', async () => {
    getContestTimes();
});

module.exports = checkContests;
