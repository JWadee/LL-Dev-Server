const cron = require('node-cron');
const { Sequelize, DataTypes, Model} = require('sequelize');
const fetchInplay = require('../endpoints/inPlayBySportIDs');
const formatUTC = require('../../utils/formatUTC');
const fetchResults = require('../endpoints/resultsByFixtureIDs');
const getLegsAndBetsByFixtureIDs = require('../../utils/getLegsAndBetsByFixtureIDs');
const settleBets = require('../../utils/settleBets/settleBets');

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

// Function to fetch inplay from LL database
const fetchInplayFromDB = async()=>{
    const inplay = [];
    //ignore metadata (it is automatically returned by sequelize - same thing as rows)
    const [rows, metaData] = await sequelize.query("SELECT jsonFixture FROM fixtures WHERE JSON_EXTRACT(jsonFixture, '$.time_status') = '1'");
    rows.forEach(row=>{
        inplay.push(row.jsonFixture);
    })
    return inplay;
};

//Function to update fixture 
const updateFixture = async(result) => {
    //stringify and escape single quote for db insert
    let strRes = JSON.stringify(result);
    let strFinal = strRes.replace(/'/g, "''");
    let sql = "UPDATE fixtures SET jsonFixture = JSON_SET(jsonFixture, '$.time_status', '3'), jsonResults = '"+strFinal+"' WHERE intRefID = "+result.bet365_id+";";
    const [row, meta] = await sequelize.query(sql);    
    return; 
}

//Function to check if fixtures are no longer inplay and need to be updated in db
const checkInplay = async(dbInplay,  inplay365) => {
    //notInplayIDs array to fixtures no longer in play
    const notInplayIDs = [];
    //check if dbInplay records are still inplay
    dbInplay.forEach(dbFixt=>{
        let index = inplay365.findIndex(fixt365=> parseInt(fixt365.id) === parseInt(dbFixt.id));
        //if not inplay check for results 
        if(index < 0){
            notInplayIDs.push(dbFixt.id)
        //else check if needs updating             
        }else{
            const updated365 = new Date(formatUTC(inplay365[index].updated_at));
            const updatedDB = new Date(formatUTC(dbFixt.updated_at));
            //if api updated time is more recent, update record
            if(updated365 > updatedDB){
              sequelize.query("UPDATE fixtures SET jsonFixture = ' "+JSON.stringify(inplay365[index])+" ' WHERE intRefID = "+dbFixt.id+";");
            };
        };
    });

    //Check for results on notInplayIDs
    let fixtResults = await fetchResults(notInplayIDs);
    let fixtResultIDs = [];
    fixtResults.forEach(result=>{
        //add id to array used to settle bets
        fixtResultIDs.push(result.bet365_id);
        //update Fixture record to change time status and insert results
        updateFixture(result);
    })

    //Update bets for finished fixtures 
    if(fixtResultIDs.length > 0){
      let openBets = await getLegsAndBetsByFixtureIDs(fixtResultIDs);
      
      //settle and update bets
      settleBets(openBets, fixtResults);
    }


    
    //Check if status not is updated in  DB (it won't be in the dbInplay array), update fixture
    inplay365.forEach(fixt365=>{
        let index = dbInplay.findIndex(dbFixt=> parseInt(dbFixt.id) === parseInt(fixt365.id));
        //if not in db update fixture 
        if(index < 0){
            sequelize.query("UPDATE fixtures SET jsonFixture = ' "+JSON.stringify(fixt365)+" ' WHERE intRefID = "+fixt365.id+";");
        }
    })

}

// Export Cron job to monitor inplay fixtures 
const monitorInplayFixtures = async() => cron.schedule('*/1 * * * *', async () => {
    //Step 1 - get inplay fixtures from database
    const dbInplay = await fetchInplayFromDB();
    //Step 2 - get inplay fixtures from Bet365API
    const inplay365 = await fetchInplay([12])
    //Step 3 - check inplay fixtures
    checkInplay(dbInplay, inplay365);
});
  
module.exports = monitorInplayFixtures;
