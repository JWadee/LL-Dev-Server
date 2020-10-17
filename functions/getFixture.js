let pool = require('../db/db');
var parsed;

const getFixtureByID =async(id)=>{
    pool.getConnection(function(err, connection){
      if(err) {
        connection.release();
        return({"code": 100, "status": "Error in database connection"});
        ;
      }
      console.log("connected as id: " + connection.threadId);
  
      let sql = "SELECT * FROM fixtures WHERE intRefID = ?";
  
      connection.query(sql, id, function(err, row) {
        connection.release();
        if(!err) {
            //Need to parse so JSON is not getting double parsed
            parsed = row.map(obj => {
                const tmp = {}
                tmp.LLFixtureID = obj.intFixtureID;
                tmp.fixture = JSON.parse(obj.jsonFixture);
                return tmp;
            })
            // console.log("Parsed");
            // console.log(parsed)

            return parsed;
        }else{
          console.log(err)
          return err;
        }
      });    
      
      connection.on('error', function(err){
        connection.release();
        res.json({"code": 100, "status": "Error in database connection"});
      })
    })
    return parsed
}
  
module.exports = getFixtureByID;