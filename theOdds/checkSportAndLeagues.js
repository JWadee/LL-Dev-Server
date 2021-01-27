const cron = require('node-cron');
const axios = require('axios');
const { Sequelize, DataTypes, Model, json} = require('sequelize');

//Initialize Sequelize
const sequelize = new Sequelize('Lineleaders', 'admin', 'LLsredael321?', {
    host: '162.249.2.42',
    dialect: 'mysql'
});

//Create sport data model 
class sport extends Model {}
sport.init({
  // Model attributes are defined here
  intSportID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  strSportName: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  // Options
  sequelize, 
  modelName: 'sport',
  timestamps: false,
});

//Create sport data model 
class league extends Model {}
league.init({
  // Model attributes are defined here
  intLeagueID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  intSportID:{
    type: DataTypes.INTEGER,
    allowNull: false
  },
  jsonLeague: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  // Options
  sequelize, 
  modelName: 'league',
  timestamps: false,
});

//File to check for unique sports and insert them into the database, and insert leagues into the database
const checkSportAndLeagues = async() => {
    let data = [
        {
            "key": "americanfootball_ncaaf",
            "active": false,
            "group": "American Football",
            "details": "US College Football",
            "title": "NCAAF",
            "has_outrights": false
        },
        {
            "key": "americanfootball_nfl",
            "active": true,
            "group": "American Football",
            "details": "US Football",
            "title": "NFL",
            "has_outrights": false
        },
        {
            "key": "aussierules_afl",
            "active": true,
            "group": "Aussie Rules",
            "details": "Aussie Football",
            "title": "AFL",
            "has_outrights": false
        },
        {
            "key": "baseball_mlb",
            "active": false,
            "group": "Baseball",
            "details": "Major League Baseball 🇺🇸",
            "title": "MLB",
            "has_outrights": false
        },
        {
            "key": "basketball_euroleague",
            "active": true,
            "group": "Basketball",
            "details": "Basketball Euroleague",
            "title": "Basketball Euroleague",
            "has_outrights": false
        },
        {
            "key": "basketball_nba",
            "active": true,
            "group": "Basketball",
            "details": "US Basketball",
            "title": "NBA",
            "has_outrights": false
        },
        {
            "key": "basketball_ncaab",
            "active": true,
            "group": "Basketball",
            "details": "US College Basketball",
            "title": "NCAAB",
            "has_outrights": false
        },
        {
            "key": "cricket_asia_cup",
            "active": false,
            "group": "Cricket",
            "details": "Asia Cup",
            "title": "Asia Cup",
            "has_outrights": false
        },
        {
            "key": "cricket_big_bash",
            "active": true,
            "group": "Cricket",
            "details": "Big Bash League",
            "title": "Big Bash",
            "has_outrights": false
        },
        {
            "key": "cricket_icc_trophy",
            "active": false,
            "group": "Cricket",
            "details": "ICC Champions Trophy",
            "title": "ICC Champions",
            "has_outrights": false
        },
        {
            "key": "cricket_icc_world_cup",
            "active": false,
            "group": "Cricket",
            "details": "ICC World Cup",
            "title": "ICC World Cup",
            "has_outrights": false
        },
        {
            "key": "cricket_ipl",
            "active": false,
            "group": "Cricket",
            "details": "Indian Premier League",
            "title": "IPL",
            "has_outrights": false
        },
        {
            "key": "cricket_ipl_t20",
            "active": false,
            "group": "Cricket",
            "details": "",
            "title": "IPL T20",
            "has_outrights": false
        },
        {
            "key": "cricket_odi",
            "active": true,
            "group": "Cricket",
            "details": "One Day Internationals",
            "title": "One Day Internationals",
            "has_outrights": false
        },
        {
            "key": "cricket_t20_natwest",
            "active": false,
            "group": "Cricket",
            "details": "",
            "title": "Natwest T20 Blast",
            "has_outrights": false
        },
        {
            "key": "cricket_test_match",
            "active": true,
            "group": "Cricket",
            "details": "International Test Matches",
            "title": "Test Matches",
            "has_outrights": false
        },
        {
            "key": "icehockey_nhl",
            "active": true,
            "group": "Ice Hockey",
            "details": "US Ice Hockey",
            "title": "NHL",
            "has_outrights": false
        },
        {
            "key": "mma_mixed_martial_arts",
            "active": true,
            "group": "Mixed Martial Arts",
            "details": "Mixed Martial Arts",
            "title": "MMA",
            "has_outrights": false
        },
        {
            "key": "rugbyleague_nrl",
            "active": true,
            "group": "Rugby League",
            "details": "Aussie Rugby League",
            "title": "NRL",
            "has_outrights": false
        },
        {
            "key": "rugbyleague_nrl_state_of_origin",
            "active": false,
            "group": "Rugby League",
            "details": "Aussie Rugby League",
            "title": "State of Origin",
            "has_outrights": false
        },
        {
            "key": "rugbyleague_world_cup",
            "active": false,
            "group": "Rugby League",
            "details": "Rugby League World Cup",
            "title": "World Cup",
            "has_outrights": false
        },
        {
            "key": "rugbyunion_aviva_premiership",
            "active": false,
            "group": "Rugby Union",
            "details": "English Rugby Union",
            "title": "Aviva Premiership",
            "has_outrights": false
        },
        {
            "key": "soccer_argentina_primera_division",
            "active": false,
            "group": "Soccer - Other",
            "details": "Superliga Argentina 🇦🇷",
            "title": "Primera División - Argentina",
            "has_outrights": false
        },
        {
            "key": "soccer_australia_aleague",
            "active": true,
            "group": "Soccer - Other",
            "details": "Aussie Soccer 🇦🇺",
            "title": "A-League",
            "has_outrights": false
        },
        {
            "key": "soccer_belgium_first_div",
            "active": true,
            "group": "Soccer - Europe",
            "details": "Belgium Soccer 🇧🇪",
            "title": "Belgium First Div",
            "has_outrights": false
        },
        {
            "key": "soccer_brazil_campeonato",
            "active": true,
            "group": "Soccer - Other",
            "details": "Campeonato Brasileiro 🇧🇷",
            "title": "Brazil Série A",
            "has_outrights": false
        },
        {
            "key": "soccer_china_superleague",
            "active": false,
            "group": "Soccer - Other",
            "details": "Chinese Soccer 🇨🇳",
            "title": "Super League - China",
            "has_outrights": false
        },
        {
            "key": "soccer_denmark_superliga",
            "active": true,
            "group": "Soccer - Europe",
            "details": "Danish Soccer 🇩🇰",
            "title": "Denmark Superliga",
            "has_outrights": false
        },
        {
            "key": "soccer_efl_champ",
            "active": true,
            "group": "Soccer - UK",
            "details": "EFL Championship 🇬🇧",
            "title": "Championship",
            "has_outrights": false
        },
        {
            "key": "soccer_england_league1",
            "active": true,
            "group": "Soccer - UK",
            "details": "EFL League 1 🇬🇧",
            "title": "League 1",
            "has_outrights": false
        },
        {
            "key": "soccer_england_league2",
            "active": true,
            "group": "Soccer - UK",
            "details": "EFL League 2  🇬🇧",
            "title": "League 2",
            "has_outrights": false
        },
        {
            "key": "soccer_epl",
            "active": true,
            "group": "Soccer - UK",
            "details": "English Premier League 🇬🇧",
            "title": "EPL",
            "has_outrights": false
        },
        {
            "key": "soccer_fa_cup",
            "active": true,
            "group": "Soccer - UK",
            "details": "English FA Cup 🇬🇧",
            "title": "FA Cup",
            "has_outrights": false
        },
        {
            "key": "soccer_fifa_world_cup",
            "active": false,
            "group": "Soccer - Other",
            "details": "FIFA World Cup 🏆",
            "title": "World Cup",
            "has_outrights": false
        },
        {
            "key": "soccer_finland_veikkausliiga",
            "active": false,
            "group": "Soccer - Europe",
            "details": "Finnish  Soccer 🇫🇮",
            "title": "Veikkausliiga - Finland",
            "has_outrights": false
        },
        {
            "key": "soccer_france_ligue_one",
            "active": true,
            "group": "Soccer - Europe",
            "details": "French Soccer 🇫🇷",
            "title": "Ligue 1 - France",
            "has_outrights": false
        },
        {
            "key": "soccer_france_ligue_two",
            "active": true,
            "group": "Soccer - Europe",
            "details": "French Soccer 🇫🇷",
            "title": "Ligue 2 - France",
            "has_outrights": false
        },
        {
            "key": "soccer_germany_bundesliga",
            "active": true,
            "group": "Soccer - Europe",
            "details": "German Soccer 🇩🇪",
            "title": "Bundesliga - Germany",
            "has_outrights": false
        },
        {
            "key": "soccer_germany_bundesliga2",
            "active": true,
            "group": "Soccer - Europe",
            "details": "German Soccer 🇩🇪",
            "title": "Bundesliga 2 - Germany",
            "has_outrights": false
        },
        {
            "key": "soccer_int_friendlies",
            "active": false,
            "group": "Soccer - Other",
            "details": "International Frienldlies ⚽",
            "title": "Int. Friendlies",
            "has_outrights": false
        },
        {
            "key": "soccer_inter_champs_cup",
            "active": false,
            "group": "Soccer - Other",
            "details": "International Champions Cup",
            "title": "Inter. Champs Cup",
            "has_outrights": false
        },
        {
            "key": "soccer_italy_serie_a",
            "active": true,
            "group": "Soccer - Europe",
            "details": "Italian Soccer 🇮🇹",
            "title": "Serie A - Italy",
            "has_outrights": false
        },
        {
            "key": "soccer_italy_serie_b",
            "active": true,
            "group": "Soccer - Europe",
            "details": "Italian Soccer 🇮🇹",
            "title": "Serie B - Italy",
            "has_outrights": false
        },
        {
            "key": "soccer_japan_j_league",
            "active": false,
            "group": "Soccer - Other",
            "details": "Japan Soccer League 🇯🇵",
            "title": "J League",
            "has_outrights": false
        },
        {
            "key": "soccer_korea_kleague1",
            "active": false,
            "group": "Soccer - Other",
            "details": "Korean Soccer 🇰🇷",
            "title": "K League 1",
            "has_outrights": false
        },
        {
            "key": "soccer_league_of_ireland",
            "active": false,
            "group": "Soccer - Europe",
            "details": "Airtricity League Premier Division 🇮🇪",
            "title": "League of Ireland",
            "has_outrights": false
        },
        {
            "key": "soccer_mexico_ligamx",
            "active": true,
            "group": "Soccer - Other",
            "details": "Mexican Soccer 🇲🇽",
            "title": "Liga MX",
            "has_outrights": false
        },
        {
            "key": "soccer_netherlands_eredivisie",
            "active": true,
            "group": "Soccer - Europe",
            "details": "Dutch Soccer 🇳🇱",
            "title": "Dutch Eredivisie",
            "has_outrights": false
        },
        {
            "key": "soccer_norway_eliteserien",
            "active": true,
            "group": "Soccer - Europe",
            "details": "Norwegian Soccer 🇳🇴",
            "title": "Eliteserien - Norway",
            "has_outrights": false
        },
        {
            "key": "soccer_portugal_primeira_liga",
            "active": true,
            "group": "Soccer - Europe",
            "details": "Portugese Soccer 🇵🇹",
            "title": "Primeira Liga - Portugal",
            "has_outrights": false
        },
        {
            "key": "soccer_russia_premier_league",
            "active": true,
            "group": "Soccer - Europe",
            "details": "Russian Soccer 🇷🇺",
            "title": "Premier League - Russia",
            "has_outrights": false
        },
        {
            "key": "soccer_spain_la_liga",
            "active": true,
            "group": "Soccer - Europe",
            "details": "Spanish Soccer 🇪🇸",
            "title": "La Liga - Spain",
            "has_outrights": false
        },
        {
            "key": "soccer_spain_segunda_division",
            "active": true,
            "group": "Soccer - Europe",
            "details": "Spanish Soccer 🇪🇸",
            "title": "La Liga 2 - Spain",
            "has_outrights": false
        },
        {
            "key": "soccer_spl",
            "active": true,
            "group": "Soccer - UK",
            "details": "Scottish Premier League 🇬🇧",
            "title": "SPL",
            "has_outrights": false
        },
        {
            "key": "soccer_sweden_allsvenskan",
            "active": false,
            "group": "Soccer - Europe",
            "details": "Swedish Soccer 🇸🇪",
            "title": "Allsvenskan - Sweden",
            "has_outrights": false
        },
        {
            "key": "soccer_sweden_superettan",
            "active": false,
            "group": "Soccer - Europe",
            "details": "Swedish Soccer 🇸🇪",
            "title": "Superettan - Sweden",
            "has_outrights": false
        },
        {
            "key": "soccer_switzerland_superleague",
            "active": true,
            "group": "Soccer - Europe",
            "details": "Swiss Soccer 🇨🇭",
            "title": "Swiss Superleague",
            "has_outrights": false
        },
        {
            "key": "soccer_turkey_super_league",
            "active": true,
            "group": "Soccer - Europe",
            "details": "Turkish Soccer 🇹🇷",
            "title": "Turkey Super League",
            "has_outrights": false
        },
        {
            "key": "soccer_uefa_champs_league",
            "active": true,
            "group": "Soccer - Europe",
            "details": "European Champions League 🇪🇺",
            "title": "UEFA Champions",
            "has_outrights": false
        },
        {
            "key": "soccer_uefa_europa_league",
            "active": true,
            "group": "Soccer - Europe",
            "details": "European Europa League 🇪🇺",
            "title": "UEFA Europa",
            "has_outrights": false
        },
        {
            "key": "soccer_usa_mls",
            "active": false,
            "group": "Soccer - Other",
            "details": "Major League Soccer 🇺🇸",
            "title": "MLS",
            "has_outrights": false
        },
        {
            "key": "tennis_atp_french_open",
            "active": false,
            "group": "Tennis",
            "details": "Roland-Garros, Men's Singles 🇫🇷",
            "title": "ATP French Open",
            "has_outrights": false
        },
        {
            "key": "tennis_atp_us_open",
            "active": false,
            "group": "Tennis",
            "details": "Men's Singles 🇺🇸",
            "title": "ATP US Open",
            "has_outrights": false
        },
        {
            "key": "tennis_wta_french_open",
            "active": false,
            "group": "Tennis",
            "details": "Roland-Garros, Women's Singles 🇫🇷",
            "title": "WTA French Open",
            "has_outrights": false
        },
        {
            "key": "tennis_wta_us_open",
            "active": false,
            "group": "Tennis",
            "details": "Women's Singles 🇺🇸",
            "title": "WTA US Open",
            "has_outrights": false
        }
    ];


    //get sports from database
    let test = await sport.findAll();
    let sports = [];
    
    test.forEach(sprt=> {
        sports.push(sprt.dataValues)
    })

    //create league records
    data.forEach(leag=>{
        //get sport index
        let index = sports.findIndex(sprt=>sprt.strSportName == leag.group)
        //get sport id 
        let sportid = sports[index].intSportID;
        //create league record
        league.create({
            intSportID: sportid,
            jsonLeague: JSON.stringify(leag)
        })
    })
   
}

// Export Cron job to check and update contest statuses
const checkSports = () => cron.schedule('*/1 * * * *', async () => {
    checkSportAndLeagues();
});

module.exports = checkSports;