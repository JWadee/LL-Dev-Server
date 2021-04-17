const formatBets = require('../functions/formatBets');

//Function to format posts
let formatPosts = (posts) => {
    const formatted = [];
    posts.forEach(post=>{
        //if bet exists, format accordingly
        if(post.intBetID!=null){
            let bets = [
                {
                    intBetID: post.intBetID, 
                    jsonBet: post.jsonBet,
                    jsonLeg: post.jsonLeg
                }
            ]
            let tmp = {
                id : post.intPostID,
                contents : JSON.parse(post.jsonContents),
                bets : formatBets(bets)
            }
            formatted.push(tmp);
        }else{
            let tmp = {
                id : post.intPostID,
                contents : JSON.parse(post.jsonContents),
                bets : []
            }
            formatted.push(tmp);
       }
    })
    return formatted;
};

module.exports = formatPosts;