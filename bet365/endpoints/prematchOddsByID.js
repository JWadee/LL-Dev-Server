/*
    Endpoint to get odds by odds by fixture id
    
    Documentation: https://1394697259.gitbook.io/bet365-api/bet365-upcoming-events
*/
const axios = require('axios');

const fetchOdds = async(ids) => {
    let odds = [];
    for(const id of ids ) {
        let response = await axios({
            "method":"GET",
            "url":"https://bet365-sports-odds.p.rapidapi.com/v3/bet365/prematch",
            "headers":{
            "content-type":"application/octet-stream",
            "x-rapidapi-host":"bet365-sports-odds.p.rapidapi.com",
            "x-rapidapi-key":"5e690d0d52msh1caf60a13036accp1c14a3jsn664378c8cd1f",
            "useQueryString":true
            },"params":{
            "FI": id
            }
        });
        odds.push(response.data.results[0])
    }
    
    return(odds);
}
    
module.exports = fetchOdds;