//function to format from epoch time
const formatUTC = (time) => {
    let adjusted = new Date(time *1000);
    let formattedTime = adjusted.toUTCString();  
    return(formattedTime);  
}

module.exports = formatUTC;