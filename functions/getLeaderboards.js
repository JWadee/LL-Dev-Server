const { ResumeToken } = require('mongodb');
const cron = require('node-cron');
const { Sequelize, DataTypes, Model} = require('sequelize');

//Initialize Sequelize
const sequelize = new Sequelize('Lineleaders', 'admin', 'LLsredael321?', {
    host: '162.249.2.42',
    dialect: 'mysql'
});

// Function to fetch players by contest id
const fetchPlayers = async(id)=>{
    const players = [];

    let sql = "SELECT cp.intContestPlayerID, a.strEmail FROM contest_players AS cp "+
    "INNER JOIN accounts as a ON cp.intAccountID = a.intAccountID "+
    "WHERE cp.intContestID = "+id+";";

    //ignore metadata (it is automatically returned by sequelize - same thing as rows)
    const [rows, metaData] = await sequelize.query(sql);
    rows.forEach(row=>{
        players.push({
            id: row.intContestPlayerID,
            email: row.strEmail,
            w: 0, 
            l: 0,
            p: 0,
            bankroll: 0
        });
    })
    return players;
};

//Function to fetch bets by contest id
const fetchBets= async(id) => {
    const bets = [];

    let sql = "SELECT bets.intContestBetID, bets.intContestPlayerID, bets.jsonBet, legs.jsonLeg  FROM contest_bets AS bets "+
              "INNER JOIN contest_bet_legs AS legs ON legs.intBetID = bets.intContestBetID "+
              "INNER JOIN contest_players AS cp ON cp.intContestPlayerID = bets.intContestPlayerID "+
              "WHERE cp.intContestID = "+id+" AND JSON_EXTRACT(jsonBet, '$.result') IN ('W','L','P');";
              //ignore metadata (it is automatically returned by sequelize - same thing as rows)
    const [rows, metaData] = await sequelize.query(sql);
    rows.forEach(row => {
        bets.push(row);
    })

    return(bets);
}
//Function to calculate winnings 
const calcWinnings = (place, typeID, prizepool) =>{
    let winnings = 0;
    //winner take all
    if(typeID === 1){
        switch(place) {
            case 1 :
                winnings = prizepool;
            break;
        }
    } 
    return winnings;
}

//Function to add winnings and place
const addPlaceAndWinnings = (leaderboards, typeID, prizepool) =>{
    leaderboards.forEach((player, i) =>{
        let place = i+1;
        let winnings = calcWinnings(place, typeID, prizepool);
        player.place = place;
        player.winnings = winnings;
    })
    
    return leaderboards;
}

//Function to get W-L record and bankroll and organize leaderboards
const formatLeaderboards = (players, bets, typeID, prizepool) => { 
    players.forEach(player => {
        let playerBets = bets.filter( bet => bet.intContestPlayerID == player.id);
        //calculate bankroll, wins, losses, and pushes
        let bankroll = 0;
        let w = 0;
        let l = 0;
        let p = 0;

        playerBets.forEach(bet=>{
            //update bankroll and record vars
            let wager = parseFloat(bet.jsonBet.wager);

            if(bet.jsonBet.result === "W" ){
                let win;
                let odds = parseFloat(bet.jsonBet.odds);
                if(odds > 0){
                    let dec = odds/100;
                    win = wager * dec
                }else{
                    let dec = Math.abs(odds)/100;
                    win = wager / dec;
                };
                bankroll = bankroll +  win;
                w = w + 1; 
            }else if(bet.jsonBet.result === "L" ){
                bankroll = bankroll - wager;
                l = l + 1;
            }else if(bet.jsonBet.result === "P" ){
                p = p + 1;
            };
        })

        player.bankroll = bankroll;
        player.w = w;
        player.l = l;
        player.p = p;
    })

    let ordered = players.sort((a,b) => b.bankroll - a.bankroll)
    let final = addPlaceAndWinnings(ordered, typeID, prizepool);

    return final;
}


const getLeaderboards = async(id, contestTypeID, prizepool) => {
    //get players by contest id 
    let players = await fetchPlayers(id);
    let bets = await fetchBets(id);
    let leaderboards =  formatLeaderboards(players, bets, contestTypeID, prizepool)
    return leaderboards;
};
  
module.exports = getLeaderboards;
