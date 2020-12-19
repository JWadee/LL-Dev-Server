const findMedian = (vals) => {
    vals.sort((a,b)=>{return a-b});
    let half = Math.floor(vals.length/2);

    if(vals.length % 2){
        return vals[half]
    }
    else return (vals[half-1] + vals[half])/2
}

module.exports = findMedian;
