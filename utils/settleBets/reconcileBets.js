const { Sequelize, DataTypes, Model} = require('sequelize');
const getPersonalLegsAndBetsByFixtureIDs = require('../../utils/getPersonalLegsAndBetsByFixtureIDs');
const cron = require('node-cron');

//Initialize Sequelize
const sequelize = new Sequelize('Lineleaders', 'admin', 'LLsredael321?', {
    host: '162.249.2.42',
    dialect: 'mysql'
});

//Function to update bet records 
const updateBetRecord = async(leg) =>{
    await sequelize.query("UPDATE personal_bets SET jsonBet = JSON_SET(jsonBet, '$.result', '"+leg.bet.result+"') WHERE intBetID = "+leg.betID+";")
    return;
}

const updateLegRecord = async(leg)=>{
    await sequelize.query("UPDATE personal_bet_legs SET jsonLeg = JSON_SET(jsonLeg, '$.result', '"+leg.leg.result+"') WHERE intLegID = "+leg.legID+";")
    return;
}

//Function to settle bets after results have been added to fixture  
const settlePersonalBets = async(fixtID) => {
    //get results from database
    const [rows, metaData] = await sequelize.query("SELECT JSON_EXTRACT(jsonFixture, '$.results') AS results FROM history_fixtures WHERE intFixtureID ="+fixtID+";");
    let results = JSON.parse(rows[0].results);
    
    let legs = await getPersonalLegsAndBetsByFixtureIDs(fixtID);
    legs.forEach(leg=>{
        //get the home and away scores
        let homeScore = parseFloat(results.home_score);
        let awayScore = parseFloat(results.away_score);
        let result;
        //settle spread bet
        if(leg.leg.line.type === "Spread"){
            let spread = parseFloat(leg.leg.line.line);
            if(leg.leg.line.team.type === "Home"){      
                if(homeScore + parseFloat(spread) > awayScore){
                    result = "W";                 
                }else if(homeScore + parseFloat(spread) === awayScore){
                    result = "P";
                }else if(homeScore + parseFloat(spread) < awayScore){
                    result = "L";
                }
            }else if(leg.leg.line.team.type === "Away"){
                if(awayScore + parseFloat(spread) > homeScore){
                    result = "W";                 
                }else if(awayScore + parseFloat(spread) === homeScore){
                    result = "P";
                }else if(awayScore + parseFloat(spread) < homeScore){
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
                if(homeScore + awayScore > parseFloat(leg.leg.line.line)){
                    result = "W";                 
                }else if(homeScore + awayScore < parseFloat(leg.leg.line.line)){
                    result = "L";                 
                }else if(homeScore + awayScore === parseFloat(leg.leg.line.line)){
                    result = "P";                 
                }
            }else if(leg.leg.line.bet === "Under"){
                if(homeScore + awayScore < parseFloat(leg.leg.line.line)){
                    result = "W";                 
                }else if(homeScore + awayScore > parseFloat(leg.leg.line.line)){
                    result = "L";                 
                }else if(homeScore + awayScore === parseFloat(leg.leg.line.line)){
                    result = "P";                 
                }
            }
        }
        //*********NOT SET UP TO HANDLE PARLAYS YET */
        //Add result to leg and bet objects to be stored in database
        leg.leg.result = result;
        leg.bet.result = result;
        updateBetRecord(leg);
        updateLegRecord(leg);    
    })
}



// Export Cron job to monitor inplay fixtures 
const reconcile = async() => cron.schedule('*/1 * * * *', async () => {
    settlePersonalBets(1826)
});
  
module.exports = reconcile;