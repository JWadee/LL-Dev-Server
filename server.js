const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const { join } = require("path");
const authConfig = require("./auth_config.json");
const cron = require("node-cron");
const checkContests = require('./services/checkContests');
const checkExists = require('./services/fixtures');
const checkFixtures = require('./services/fixtureResults/soccerFixtureResults');
const checkUpcoming = require('./bet365/services/monitorUpcomingFixtures');
const monitorInplayFixtures = require('./bet365/services/monitorInPlayFixtures');
const monitorBook = require('./theOdds/monitorBook');
const reconcile = require('./utils/settleBets/reconcileBets');
const checkSports = require('./theOdds/checkSportAndLeagues');

//routes 
const accountsRouter = require('./routes/accounts');
const betsRouter = require('./routes/bets');
const contestsRouter = require('./routes/contests');
const fixturesRouter = require('./routes/fixtures');
const leaguesRouter = require('./routes/leagues');
const sportsRouter = require('./routes/sports');
const postsRouter = require('./routes/posts');

const app = express();



if (!authConfig.domain || !authConfig.audience) {
  throw new Error(
    "Please make sure that auth_config.json is in place and populated"
  );
}

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "*"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  next();
});


app.use(morgan("dev"));
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(bodyParser.json());
app.use(express.static(join(__dirname, "build")));

//use routes 
app.use('/accounts', accountsRouter);
app.use('/bets', betsRouter);
app.use('/contests', contestsRouter);
app.use('/fixtures', fixturesRouter);
app.use('/leagues', leaguesRouter);
app.use('/sports', sportsRouter);
app.use('/posts', postsRouter);

//Cron jobs 
checkContests();
// checkExists();
// checkFixtures();
// checkUpcoming();
// monitorInplayFixtures();


// reconcile();
monitorBook();
// checkSports();

module.exports = app;