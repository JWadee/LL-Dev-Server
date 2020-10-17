var express = require('express');
var router = express.Router();
let pool = require('../db/db');



function getAllSports(req, res){
  pool.getConnection(function(err, connection){
    if(err) {      
      console.log(err)
      connection.release();
      res.json({"code": 100, "status": "Error in database connection"});
      return;
    }
    console.log("connected as id: " + connection.threadId);

    let sql = "SELECT * FROM sports";

    connection.query(sql, function(err, row) {
      connection.release();
      if(!err) {
        res.json(row)   
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
  getAllSports(req, res);
});

module.exports = router;
