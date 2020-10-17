const { Sequelize} = require('sequelize');


//Initialize Sequelize
const sequelize = new Sequelize('Lineleaders', 'admin', 'LLsredael321?', {
    host: '162.249.2.42',
    dialect: 'mysql'
});


//Function to get bet legs by fixture id, format the legs, and send them to be settled
const getLegsAndBetsByFixtureIDs = async (ids) =>{
 
    const [rows, metaData] = await sequelize.query(
        "SELECT legs.intLegID, legs.intBetID, legs.jsonLeg, bets.jsonBet FROM contest_bet_legs AS legs "+
        "INNER JOIN contest_bets AS bets ON bets.intContestBetID = legs.intBetID "+ 
        "WHERE intFixtureRefID IN ("+ids+");"
    );    
        
    let legs = [];
    rows.forEach(row=>{
        let leg = {
            legID : row.intLegID,
            betID : row.intBetID,
            leg : row.jsonLeg,
            bet : row.jsonBet
        }
        legs.push(leg);
    })
    return(legs);
}
module.exports = getLegsAndBetsByFixtureIDs;