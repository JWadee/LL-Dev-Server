const { Sequelize} = require('sequelize');


//Initialize Sequelize
const sequelize = new Sequelize('Lineleaders', 'admin', 'LLsredael321?', {
    host: '162.249.2.42',
    dialect: 'mysql'
});

//Function to get bet legs by fixture id, format the legs, and send them to be settled
const getCurrentFixtures = async() =>{
    const [rows, metaData] = await sequelize.query("SELECT * FROM current_fixtures");        
    return(rows);
}

module.exports = getCurrentFixtures;
