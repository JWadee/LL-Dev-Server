const axios = require('axios');
const cron = require('node-cron');
const getCurrentFixtures =  require('../utils/getCurrentFixtures');
const { Sequelize, DataTypes, Model} = require('sequelize');
const findMedian = require('../utils/median');
const compareProperties = require('../utils/compareObjProperties');
const formatUTC = require('../utils/formatUTC');

//Initialize Sequelize
const sequelize = new Sequelize('Lineleaders', 'admin', 'LLsredael321?', {
    host: '162.249.2.42',
    dialect: 'mysql'
});

//Create fixture data model 
class fixture extends Model {}
fixture.init({
  // Model attributes are defined here
  intFixtureID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  jsonFixture: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dtmStart: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  // Options
  sequelize, 
  modelName: 'current_fixture',
  timestamps: false,
});

//Create history fixt data model 
class historyFixt extends Model {}
historyFixt.init({
  // Model attributes are defined here
  intFixtureID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: false
  },
  jsonFixture: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  // Options
  sequelize, 
  modelName: 'history_fixture',
  timestamps: false,
});


//Function to create fixture records 
const createFixtures = (fixtures)=>{
    //create fixture records
    let records = [];
    fixtures.forEach(fixture =>{
      let record = {
        jsonFixture: JSON.stringify(fixture),
        dtmStart: formatUTC(fixture.commence_time)
      }
      records.push(record)
    })
    fixture.bulkCreate([...records]);
}

const moveFixturesToHistory= async(fixtures) =>{
    //array for fixtures
    let records = [];
    let ids = [];

    //add to record and id arrays
    fixtures.forEach(fixture =>{
        let record = {
            intFixtureID: fixture.intFixtureID, 
            jsonFixture: JSON.stringify(fixture.jsonFixture),
            dtmStart: fixture.dtmStart
        }
        records.push(record);
        ids.push(fixture.intFixtureID)
    })
    
    //perform transaction to move fixtures 
    try {
        const result = await sequelize.transaction(async (t) => {
            //insert into history
            await historyFixt.bulkCreate([...records], { transaction: t });
          
            //remove from current
            await fixture.destroy({
                where: {
                    intFixtureID: ids
                }
            }, { transaction: t })     
        });
    }catch (error) {
        console.log(error)
    }
}

const updateFixtures = (fixtures) => {
    fixtures.forEach(async(fixt) => {
        const [res, meta] = await sequelize.query("UPDATE current_fixtures SET jsonFixture = ' "+JSON.stringify(fixt.jsonFixture)+" ' WHERE intFixtureID = "+fixt.intFixtureID+";");
        return;
    })
}

const formatSpread = (spread) => {   
    //get away and home team index
    let away_team_index = spread.teams.findIndex(team=> team != spread.home_team);
    let home_team_index = spread.teams.findIndex(team=> team === spread.home_team);

    if(spread.sites.length > 0){
        //find median for consensus odds 
        let awayOdds = [];
        let awayPoints = [];
        let homeOdds = [];
        let homePoints = [];

        spread.sites.forEach(odd=>{
            awayOdds.push(parseFloat(odd.odds.spreads.odds[away_team_index]))
            awayPoints.push(parseFloat(odd.odds.spreads.points[away_team_index]))
            homeOdds.push(parseFloat(odd.odds.spreads.odds[home_team_index]))
            homePoints.push(parseFloat(odd.odds.spreads.points[home_team_index]))
        })

        let awayMedianOdds = findMedian(awayOdds)
        let awayMedianPoints = findMedian(awayPoints)
        let homeMedianOdds = findMedian(homeOdds)
        let homeMedianPoints = findMedian(homePoints)

        //format object
        const formatted = {
            'home': {
                'odds': homeMedianOdds,
                'points': homeMedianPoints
            }, 
            'away' :{
                'odds': awayMedianOdds,
                'points': awayMedianPoints
            }
        }
        return formatted;
    }else return {};
}

const formatTotal = (total) => {   
    if(total.sites.length > 0){
         //find median for consensus odds 
         let overOdds = [];
         let underOdds = [];
         let points = [];

         total.sites.forEach(odd=>{
             overOdds.push(parseFloat(odd.odds.totals.odds[0]))
             underOdds.push(parseFloat(odd.odds.totals.odds[1]))
             points.push(parseFloat(odd.odds.totals.points[0]))
         })

         let overMedianOdds = findMedian(overOdds)
         let underMedianOdds = findMedian(underOdds)
         let medianPoints = findMedian(points)

         //format object
        const formatted = {
            'over': overMedianOdds,
            'under': underMedianOdds,
            'points': medianPoints
        }
    return formatted;
    }else return {};   
}

const formatH2h = (h2h) => {
    let formatted = {};
    let away_team_index = h2h.teams.findIndex(team=> team != h2h.home_team);
    let home_team_index = h2h.teams.findIndex(team=> team === h2h.home_team);

    if(h2h.sites.length> 0){
        let homeOdds = [];
        let awayOdds = [];

        h2h.sites.forEach(site => {
            homeOdds.push(parseFloat(site.odds.h2h[home_team_index]))
            awayOdds.push(parseFloat(site.odds.h2h[away_team_index]))
        })

        let homeMedian = findMedian(homeOdds);
        let awayMedian = findMedian(awayOdds)

        //format object
        formatted = {
            'home': homeMedian,
            'away': awayMedian
        }
        return formatted;
    }else return {};
}

const fetchBook = async() => {
    //Fetch upcoming and inplay for each market    
    let totalsResponse = await axios({
        "method":"GET",
        "url":"https://api.the-odds-api.com/v3/odds/?sport=upcoming&region=us&dateFormat=unix&mkt=totals&oddsFormat=american&apiKey=2ee98dcf826d5779310963812779b148",
        "headers":{
            "content-type":"application/json",
            "useQueryString":true
        },"params":{
        }
    });
    let h2hResponse = await axios({
        "method":"GET",
        "url":"https://api.the-odds-api.com/v3/odds/?sport=upcoming&region=us&dateFormat=unix&mkt=h2h&oddsFormat=american&apiKey=2ee98dcf826d5779310963812779b148",
        "headers":{
            "content-type":"application/json",
            "useQueryString":true
        },"params":{
        }
    });
    let spreadsResponse = await axios({
        "method":"GET",
        "url":"https://api.the-odds-api.com/v3/odds/?sport=upcoming&region=us&dateFormat=unix&mkt=spreads&oddsFormat=american&apiKey=2ee98dcf826d5779310963812779b148",
        "headers":{
            "content-type":"application/json",
            "useQueryString":true
        },"params":{
        }
    });

    let totals = totalsResponse.data.data;
    let h2h = h2hResponse.data.data;
    let spreads = spreadsResponse.data.data

    //book array for api results
    let book = [];

    //Format fixtures and insert to book array (use h2h to loop through as it is the most comprehensive odds market covered)
    h2h.forEach(h2hFixt => {
        //get away team
        let away_team_index = h2hFixt.teams.findIndex(team=> team != h2hFixt.home_team);
        let away_team = h2hFixt.teams[away_team_index];

        //find spread index and format spread obj
        let spread_index = spreads.findIndex(fixt=> fixt.home_team === h2hFixt.home_team);
        let formatted_spread = formatSpread(spreads[spread_index])

        //find total index and format total obj
        let total_index = totals.findIndex(fixt=> fixt.home_team === h2hFixt.home_team);
        let formatted_total = formatTotal(totals[total_index])

        //format h2h 
        let h2h_formatted = formatH2h(h2hFixt);

        //create formatted fixture
        let formatted = {
            'sport_key' : h2hFixt.sport_key,
            'sport_nice': h2hFixt.sport_nice,
            'commence_time': h2hFixt.commence_time,
            'home_team': h2hFixt.home_team,
            'away_team': away_team,
            'odds': {
                'h2h':h2h_formatted,
                'spreads':formatted_spread,
                'totals':formatted_total
            }
        }
        book.push(formatted);

    });

    return book;
}

//Function to check whether fixtures need moved to history, updated in current, or added to history
const checkArrays = (book, current_stored) => {
    let moveToHistory = [];
    let addToCurrent = [];
    let updateCurrent = [];

    //loop api response, check whether new fixts are there or any updates required 
    book.forEach(bookFixt =>{
        //Check if existing in database
        let dbIndex = current_stored.findIndex(fixt => fixt.jsonFixture.home_team === bookFixt.home_team);
        //if existing check for updates
        if(dbIndex > -1){
            if(compareProperties(bookFixt, current_stored[dbIndex].jsonFixture) === false){
                let newFixt = {
                    intFixtureID: current_stored[dbIndex].intFixtureID, 
                    jsonFixture: bookFixt
                }
                updateCurrent.push(newFixt)
            }
        }
        //else add to current fixtures
        else{
            addToCurrent.push(bookFixt);
        }
    })

    //loop database array, check if no longer in api response
    current_stored.forEach(dbFixt => {
        //Check if existing in api
        let bookIndex = book.findIndex(fixt => fixt.home_team === dbFixt.jsonFixture.home_team);
        
        //if not in api, move to history
        if(bookIndex === -1){
            moveToHistory.push(dbFixt);
        }
    })

    //Create new fixtures
    if(addToCurrent.length > 0){
        createFixtures(addToCurrent);
    }
    //Move finished to history 
    if(moveToHistory.length > 0){
        moveFixturesToHistory(moveToHistory);
    }
    //Update current fixtures 
    if(updateCurrent.length > 0){
        updateFixtures(updateCurrent);
    }
}

// Export Cron job to check and update contest statuses
const monitorBook = () => cron.schedule('*/15 * * * *', async () => {
    let book = await fetchBook(); 
    let current_stored = await getCurrentFixtures();
    //compare arrays and perform necessary tasks
    checkArrays(book, current_stored);
});
  
module.exports = monitorBook;