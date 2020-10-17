const cron = require("node-cron");
const getFixtureByID = require('../functions/getFixture');

/*
    1. Fetch Fixtures
    2. For each fixture -> fetch odds
    3. If record doesn't exist -> 
        a. Insert odds record, return oddsID 
        b. Insert fixture record with oddsID
*/

let fixture = {
    "id": "1616102",
    "sport_id": "1",
    "time": "1558597500",
    "time_status": "0",
    "league": {
        "id": "2402",
        "name": "Bangladesh Championship League",
        "cc": "bd"
    },
    "home": {
        "id": "61757",
        "name": "Agrani Bank Ltd SC",
        "image_id": "295988",
        "cc": "bd"
    },
    "away": {
        "id": "9245",
        "name": "Uttar Baridhara Club",
        "image_id": null,
        "cc": "bd"
    },
    "ss": null,
    "has_lineup": 0
}



const fetchFixtures = () => {
    //need to fetch fixtures 
    let fixtures = [{
        "id": "1616102",
        "sport_id": "1",
        "time": "1558597500",
        "time_status": "0",
        "league": {
            "id": "2402",
            "name": "Bangladesh Championship League",
            "cc": "bd"
        },
        "home": {
            "id": "61757",
            "name": "Agrani Bank Ltd SC",
            "image_id": "295988",
            "cc": "bd"
        },
        "away": {
            "id": "9245",
            "name": "Uttar Baridhara Club",
            "image_id": null,
            "cc": "bd"
        },
        "ss": null,
        "has_lineup": 0
    }]

    
}

const fetchOdds = () => {
    let odds = {   
        "1_1": [
            {
                "id": "28948880",
                "home_od": "401.000",
                "draw_od": "51.000",
                "away_od": "1.002",
                "ss": "0-2",
                "time_str": "89",
                "add_time": "1546802147"
            }
        ],
        "1_2" : [
            {
                "id": "28948880",
                "home_od": "401.000",
                "draw_od": "51.000",
                "away_od": "1.002",
                "ss": "0-2",
                "time_str": "89",
                "add_time": "1546802147"
            }
        ]
    }
}

const checkExists = async(id) => {
    let response = await getFixtureByID(id);
    // let data = await JSON.parse(response);
    console.log("Check Exists");
    console.log(response);
}

const insertFixture = () => {

}

const insertOdds = () => { 

}

const formatFixture = (fixture, oddsID) => {
    let record = {
        fixtureID : fixture.id,
        leagueID : fixture.league.id,
        fixture : fixture, 
        dtmStart : start,
        currentOddsID : oddsID
    }
} 

const formatOdds = (odds, fixtureID) => {
 
} 

// Export Cron job to check and update contest statuses
const checkContests = () => cron.schedule('*/1 * * * *', async () => {
    checkExists(86580234);
});

module.exports = checkContests;
