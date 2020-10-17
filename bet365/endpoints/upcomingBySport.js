/*
    Endpoint to get upcoming fixtures by sport
    
    Documentation: https://1394697259.gitbook.io/bet365-api/bet365-upcoming-events
*/
const axios = require('axios');

const fetchOdds = async(id) => {

    let response = await axios({
        "method":"GET",
        "url":"https://bet365-sports-odds.p.rapidapi.com/v1/bet365/upcoming",
        "headers":{
        "content-type":"application/octet-stream",
        "x-rapidapi-host":"bet365-sports-odds.p.rapidapi.com",
        "x-rapidapi-key":"5e690d0d52msh1caf60a13036accp1c14a3jsn664378c8cd1f",
        "useQueryString":true
        },"params":{
        "sport_id":id
        }
        })
        .catch((error)=>{
          console.log(error)
        })
    return response.data.results;
}
    
module.exports = fetchOdds;