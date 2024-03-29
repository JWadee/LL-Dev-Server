var express = require('express');
var router = express.Router();
var checkJwt = require('../services/checkJwt');
let pool = require('../db/db');
const formidable = require('formidable')
const os = require('os');
const fs = require('fs');
const path  = require('path');

function getDetails(req,res){
  pool.getConnection(function(err, connection){
    if(err) {
      connection.release();
      res.json({"code": 100, "status": "Error in database connection"});
      return;
    }
    console.log("connected as id: " + connection.threadId);

    let sql = "SELECT intAccountID, strUserName FROM accounts WHERE strAuthID = ?";
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

function checkUsername(req,res){
  pool.getConnection(function(err, connection){
    if(err) {
      connection.release();
      res.json({"code": 100, "status": "Error in database connection"});
      return;
    }
    console.log("connected as id: " + connection.threadId);

    let sql = "SELECT COUNT(*) AS Taken FROM accounts WHERE strUserName = ?;";

    connection.query(sql, req.query.username, function(err, row) {
      connection.release();
      if(!err) {
        res.json(row[0].Taken);
      }
    });    
  
    connection.on('error', function(err){
      connection.release();
      res.json({"code": 100, "status": "Error in database connection"});
    })
  })
}

function setUsername(req, res){
  pool.getConnection(function(err, connection){
    if(err) {
      connection.release();
      res.json({"code": 100, "status": "Error in database connection"});
      return;
    }
    console.log("connected as id: " + connection.threadId);

    let sql = "UPDATE accounts SET strUserName = ? WHERE intAccountID = ?";
    let vals = [req.body.username, req.body.id];

    connection.query(sql, vals, function(err, row) {
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
};

function setProfPic(req, res){
  let imageFileName; 
  let imageToBeUploaded;
  let filePath;
  const form = new formidable.IncomingForm()
  form.parse(req, (err, fields, files) =>{
    if (err) {
      console.error('Error', err)
      throw err
    }
    let oldpath = files.image.path;
    let ext = files.image.name.split('.')[files.image.name.split('.').length - 1]
    let filename = fields.id+"."+ext;
    let newpath = path.join( os.homedir(),"/images/avatars/"+filename);
    fs.rename(oldpath, newpath, function (err) {
      if (err) throw err;
      res.json('File uploaded and moved!');
    });

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

router.get('/checkUsername', function(req, res){
  checkUsername(req, res);
})

router.post('/setUsername', function(req, res){
  setUsername(req, res);
})

router.post('/setProfPic', function(req, res){
  setProfPic(req, res);
})



module.exports = router;
