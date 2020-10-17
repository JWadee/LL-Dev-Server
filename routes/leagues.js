var express = require('express');
var router = express.Router();
let pool = require('../db/db');



function getAllLeagues(req, res){
  pool.getConnection(function(err, connection){
    if(err) {
      connection.release();
      res.json({"code": 100, "status": "Error in database connection"});
      return;
    }
    console.log("connected as id: " + connection.threadId);

    let sql = "SELECT * FROM leagues";

    connection.query(sql, function(err, rows) {
      connection.release();
      if(!err) {
        res.json(rows)   
      }else{
        console.log(err)
      }
    });    
    
    connection.on('error', function(err){
      connection.release();
      res.json({"code": 100, "status": "Error in database connection"});
    })
  })
}

router.get('/', function(req, res) { 
  getAllLeagues(req, res);
});

module.exports = router;
