/*
    Endpoint to get odds by inplay fixtures by sport ids 
    Documentation: https://1394697259.gitbook.io/bet365-api/bet365-upcoming-events
*/
const axios = require('axios');

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
};

const fetchInplay = async(ids) => {
    let inplay = [];
    for(const id of ids ) {
        let response = await axios({
            "method":"GET",
            "url":"https://bet365-sports-odds.p.rapidapi.com/v1/bet365/inplay_filter",
            "headers":{
            "content-type":"application/octet-stream",
            "x-rapidapi-host":"bet365-sports-odds.p.rapidapi.com",
            "x-rapidapi-key":"5e690d0d52msh1caf60a13036accp1c14a3jsn664378c8cd1f",
            "useQueryString":true
            },"params":{
            "sport_id": id
            }
        });
        if( ! isEmpty(response.data.results)){
            response.data.results.forEach(fixt => {
                inplay.push(fixt)
            });
        } 
    }
    
    return(inplay);
}
    
module.exports = fetchInplay;