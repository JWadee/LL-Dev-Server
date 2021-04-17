const { Sequelize, DataTypes, Model} = require('sequelize');
const fetchInplay = require("../../bet365/endpoints/inPlayBySportIDs");

//Initialize Sequelize
const sequelize = new Sequelize('Lineleaders', 'admin', 'LLsredael321?', {
    host: '162.249.2.42',
    dialect: 'mysql'
});

//Function to update bet records 
const updateBetRecord = async(leg) =>{
    await sequelize.query("UPDATE contest_bets SET jsonBet = JSON_SET(jsonBet, '$.result', '"+leg.bet.result+"') WHERE intContestBetID = "+leg.betID+";")
    return;
}

const updateLegRecord = async(leg)=>{
    await sequelize.query("UPDATE contest_bet_legs SET jsonLeg = JSON_SET(jsonLeg, '$.result', '"+leg.leg.result+"') WHERE intLegID = "+leg.legID+";")
    return;
}

//Function to settle bets after results have been added to fixture  
const settleBets = (legs, fixtResults) => {
    legs.forEach(leg=>{
        //get results index
        let index = fixtResults.findIndex(results=> parseInt(results.bet365_id) === parseInt(leg.leg.fixture.fixtureID));
        let results = fixtResults[index];
        //get the home and away scores
        let ss = results.ss.split("-");
        let homeScore = parseFloat(ss[0]);
        let awayScore = parseFloat(ss[1]);
        let result;
        

        //settle spread bet
        if(leg.leg.line.type === "Spread"){
            let spread = parseFloat(leg.leg.line.line);
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

        updateBetRecord(leg);
        updateLegRecord(leg);    
    })
}

module.exports = settleBets;
