const formatBets = require('../functions/formatBets');

//Function to format posts
let formatPosts = (posts) => {
    const formatted = [];
    posts.forEach(post=>{
        const index = formatted.indexOf(bet => bet.id === record.intBetID);
        let bets = [
            {
                intBetID: post.intBetID, 
                jsonBet: post.jsonBet,
                jsonLeg: post.jsonLeg
            }
        ]
        if(index === -1){
            let tmp = {
                id : post.intPostID,
                contents : JSON.parse(post.jsonContents),
                bets : formatBets(bets)
            }
            formatted.push(tmp);
        }
    })
    return formatted;
};

module.exports = formatPosts;