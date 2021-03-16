//Function to format bets and legs from database

//NOTE CURRENTLY ONLY ABLE TO HANDLE STRAIGHT BETS
const formatBets = (records) => {
    const formatted = [];
    records.forEach(record => {
        const index = formatted.indexOf(bet => bet.id === record.intBetID);
        if(index === -1){
            let bet = JSON.parse(record.jsonBet);
            bet.id = record.intBetID;
            bet.legs = [];
            bet.legs.push(JSON.parse(record.jsonLeg));
            //check for timestamp - personal bets don't currently have that
            if(record.hasOwnProperty("strTimestamp") === true){
                bet.timestamp = record.strTimestamp
            }
            formatted.push(bet)
        //Need functionality to add leg to existing bet
        }else{
        }
    });
    return formatted;
}

module.exports = formatBets;