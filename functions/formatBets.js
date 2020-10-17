//Function to format bets and legs from database

//NOTE CURRENTLY ONLY ABLE TO HANDLE STRAIGHT BETS
const formatBets = (records) => {
    const formatted = [];
    records.forEach(record => {
        const index = formatted.map(bet => bet.id).indexOf(record.intContestBetID);
        if(index === -1){
            let bet = JSON.parse(record.jsonBet)
            bet.legs = [];
            bet.legs.push(JSON.parse(record.jsonLeg));
            
            formatted.push(bet)
        //Need functionality to add leg to existing bet
        }else{
        }
    });
    return formatted;
}

module.exports = formatBets;