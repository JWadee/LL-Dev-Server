const cron = require('node-cron');
const { Sequelize, DataTypes, Model} = require('sequelize');
const fetchUpcomingBySport = require('../endpoints/upcomingBySport');
const formatUTC = require('../../utils/formatUTC');
const fetchOdds = require('../endpoints/prematchOddsByID');
const { response } = require('express');
//Initialize Sequelize
const sequelize = new Sequelize('Lineleaders', 'admin', 'LLsredael321?', {
    host: '162.249.2.42',
    dialect: 'mysql'
});
const fetchResults = require('../endpoints/resultsByFixtureIDs');

//Create fixture data model 
class fixture extends Model {}

fixture.init({
  // Model attributes are defined here
  intFixtureID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  intRefID: {
    type: DataTypes.INTEGER,
    allowNull:false
  },
  intLeagueID: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  jsonFixture: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dtmStart: {
    type: DataTypes.DATE,
    allowNull: false
  },
  jsonResults: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  // Options
  sequelize, 
  modelName: 'fixture',
  timestamps: false,
});

//Create odds data model 
class odds extends Model {}

odds.init({
  // Model attributes are defined here
  intFixtureOddsID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  intFixtureID: {
    type: DataTypes.INTEGER,
    allowNull:false
  },
  jsonOdds: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  // Options
  sequelize, 
  modelName: 'odds',
  timestamps: false,
  tableName: 'fixture_odds'
});

//League Data Model  
class league extends Model {}

league.init({
  intLeagueID:{
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  strLeagueName: {
    type: DataTypes.STRING,
    allowNull: false    
  },
  intSportID:{
    type: DataTypes.INTEGER,
    allowNull:false
  }
}, {
  // Options
  sequelize, 
  modelName: 'league',
  timestamps: false
});

//Function to create odds 
const createOdds = (oddsArr) => {
  //create records
  let records = [];
  oddsArr.forEach(odds =>{
    let record = {
      intFixtureID: odds.FI,
      jsonOdds: JSON.stringify(odds),
    }
    records.push(record)
  })
  odds.bulkCreate([...records]);
}

//Function to fetch leagues 
const findLeagues= async() => {
  let leagueIDs = [];
  let rows = await league.findAll({
    attributes: ['intLeagueID']
  });

  rows.forEach(row=>{
    leagueIDs.push(row.dataValues.intLeagueID)
  })
  return leagueIDs
}

//Function to create league 
const createLeague = async(newLeague, sportid) => {
  const res = await league.create({
    intLeagueID: newLeague.id,
    strLeagueName: newLeague.name,
    intSportID: sportid 
  });
  return newLeague.id
}

//Function to fetch fixtures for all sports 
const fetchUpcoming = async(leagueIDs) => {
  let sportIDs = [12];
  let fixtures = [];
  for (const id of sportIDs) {
    let tmpFixts = await fetchUpcomingBySport(id)
    tmpFixts.forEach(async(fixt) => {
      //check if league exists and create new record if not
      let index = leagueIDs.indexOf(parseInt(fixt.league.id));
      if(index === -1){
        let id = await createLeague(fixt.league, fixt.sport_id);
        leagueIDs.push(id)
      }
      fixtures.push(fixt)
    });
  }
  return fixtures;
}

//Function to find fixtures by fixtures ID array
const findFixtures = async(fixtures)=>{
  let fixtureIDs = fixtures.map( fixture => {
    return fixture.id;
  });


  const rows = await fixture.findAll({
    where: {
      intRefID : fixtureIDs
    }
  })

  //Remove any existing fixtures 
  rows.forEach(row=>{
    let index = fixtures.findIndex(fixt=> parseInt(fixt.id) === row.dataValues.intRefID);
    fixtures.splice(index, 1);
  })
  return fixtures;
}

//Function to create fixture records 
const createFixtures = (fixtures)=>{
  //create fixture records
  let records = [];
  fixtures.forEach(fixture =>{
    let record = {
      intLeagueID: fixture.league.id,
      jsonFixture: JSON.stringify(fixture),
      dtmStart: formatUTC(fixture.time),
      intRefID: fixture.id
    }
    records.push(record)
  })
  let res = fixture.bulkCreate([...records]);
  return res;
}

// Export Cron job to check and update contest statuses
const checkUpcoming = () => cron.schedule('*/15 * * * *', async () => {
  //Step 1 - Find leagues
  let leagueIDs = await findLeagues();
  //Step 2 - Fetch fixtures for each sport 
  let fixtures = await fetchUpcoming(leagueIDs);
  //Step 3 - Find existing fixtures and create array
  let newFixtures = await findFixtures(fixtures);
  //Step 4 - Fetch upcoming odds for new fixtures 
  let fixtureIDs = newFixtures.map(fixt=>{
    return fixt.id;
  });
  let odds = await fetchOdds(fixtureIDs);
  //Step 5 - Create fixture records 
  let createdFixts = await createFixtures(newFixtures, odds);
  //Step 6 - Create odds records
  if(createdFixts.length === odds.length){
    createOdds(odds)
  }
});

module.exports = checkUpcoming;