/*
    Endpoint to get odds by results by fixture ids
    
    Documentation: https://1394697259.gitbook.io/bet365-api/bet365-upcoming-events
*/

const axios = require("axios");

const fetchResults = async(ids) => {
    let results = [];
    //array to hold arrays of ids by groups of 10 (max amount allowed per request)
    let idsBy10 = [];
    ids.forEach((id, i) =>{
        //if index is 0 or divisible by 10 start new group of ids, else push to last group 
        if(i === 0 || i % 10 === 0){
            idsBy10.push([id])
        }else{
            idsBy10[(idsBy10.length - 1)].push(id)
        };
    })

    for(const group of idsBy10 ) {
        let ids = group.join();
        let response = await axios({
            "method":"GET",
            "url":"https://bet365-sports-odds.p.rapidapi.com/v1/bet365/result",
            "headers":{
            "content-type":"application/octet-stream",
            "x-rapidapi-host":"bet365-sports-odds.p.rapidapi.com",
            "x-rapidapi-key":"5e690d0d52msh1caf60a13036accp1c14a3jsn664378c8cd1f",
            "useQueryString":true
            },"params":{
            "event_id":ids
            }
        });
        response.data.results.forEach(result => {
            //if time status is ended (3) add to results array
            if(parseInt(result.time_status) === 3){
                results.push(result);
            };
        });
    }

    return results
}

module.exports = fetchResults;