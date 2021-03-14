var express = require('express');
var router = express.Router();
let pool = require('../db/db');



function createPost(req,res) {
    pool.getConnection(function(err, connection){
        if(err) {
            connection.release();
            res.json({"code": 100, "status": "Error in database connection"});
            return;
        }
  
        let postSql ="INSERT INTO posts (intAccountID, jsonContents) VALUES (?, ?)";
  
        let postVals = [req.body.accountid, req.body.contents];
  
        connection.query(postSql, postVals, function(err, result) {
            if(!err) {
              //Add contest league records
              let postID = result.insertId;
              let values = '';
              //loop through leagues to build query
              req.body.betIDs.forEach((betID, idx, arr) => {
                //if first index and only id
                if(idx === 0 && arr.length === 1){
                  values = "VALUES ("+betID+", "+postID+");"
                //if first index and more than one id
                }else if(idx === 0){
                  values = "VALUES ("+betID+", "+postID+"), "
                //if last index
                }else if(idx === arr.length - 1){
                  values = values+"("+betID+", "+postID+");"
                //if neither first or last index
                }else{
                  values = values+"("+betID+", "+postID+"), "
                }
              });
  
              let pbSql = "INSERT INTO post_bets (intBetID, intPostID) "+values;
              
              connection.query(pbSql, function(err, result) {
                connection.release();
                if(!err) {
                  res.json("success");
                }else{
                  console.log(err)
                }
              });
            }else{
              console.log(err);
              connection.release();
            } 
        });    
  
        connection.on('error', function(err){
            connection.release();
            res.json({"code": 100, "status": "Error in database connection"});
        })
    })
};

router.post('/create', function(req, res) { 
    createPost(req, res);
});
  
  module.exports = router;