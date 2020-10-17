var express = require('express');
var router = express.Router();
var checkJwt = require('../services/checkJwt');
let pool = require('../db/db');

function getDetails(req,res){
  pool.getConnection(function(err, connection){
    if(err) {
      connection.release();
      res.json({"code": 100, "status": "Error in database connection"});
      return;
    }
    console.log("connected as id: " + connection.threadId);

    let sql = "SELECT intAccountID FROM accounts WHERE strAuthID = ?";
    //parse Auth0 ID string to get id after "|"
    let authID = req.substring(req.indexOf("|") + 1);

    connection.query(sql, authID, function(err, rows) {
      connection.release();
      if(!err) {
        res.json(rows[0])
      }
    });    
  
    connection.on('error', function(err){
      connection.release();
      res.json({"code": 100, "status": "Error in database connection"});
    })
  })
}

function getBalance(req, res){
  const ID = req;

  pool.getConnection(function(err, connection){
    if(err){
      connection.release();
      res.json({"code": 100, "status": "Error in database connection"});
      return;
    }
    console.log("connected as id: " + connection.threadId);

    const sql = "SELECT MAX(t.monBalance) AS balance from transactions AS t "+ 
                " INNER JOIN accounts AS a "+
                "   ON a.intAccountID = t.intAccountID "+
                " WHERE t.intAccountID = ?";
    

    connection.query(sql, ID, function(err, rows){
      connection.release();
      if(!err) {
        if(rows.length > 0){
          res.json(rows[0])
        }else res.json(0)
      }
    })

    connection.on('error', function(err){
      res.json({"code": 100, "status": "Error in database connection"});
    })
  })
}

router.get('/details', checkJwt, function(req, res) { 
  getDetails(req.user.sub, res);
});

/* GET permissions   */
router.get('/permissions', checkJwt, function(req, res) {
  res.send(
    req.user.permissions
  )
});

router.get('/balance', function(req, res){
  getBalance(req.query.ID, res);
})

module.exports = router;
