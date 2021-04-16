var express = require('express');
var router = express.Router();
let pool = require('../db/db');
const formatPosts = require('../functions/formatPosts');


function createPost(req, res) {
  pool.getConnection(function (err, connection) {
    if (err) {
      connection.release();
      res.json({ "code": 100, "status": "Error in database connection" });
      return;
    }

    let postSql = "INSERT INTO posts (intAccountID, jsonContents) VALUES (?, ?)";

    let postVals = [req.body.accountid, req.body.contents];

    //insert post
    connection.query(postSql, postVals, function (err, result) {
      //if not error check for bets  
      if (!err) {
        //if there are bets, insert them
        if(req.body.betIDs.length > 0) {
          //Add contest league records
          let postID = result.insertId;
          let values = '';
          //loop through leagues to build query
          req.body.betIDs.forEach((betID, idx, arr) => {
            //if first index and only id
            if (idx === 0 && arr.length === 1) {
              values = "VALUES (" + betID + ", " + postID + ");"
              //if first index and more than one id
            } else if (idx === 0) {
              values = "VALUES (" + betID + ", " + postID + "), "
              //if last index
            } else if (idx === arr.length - 1) {
              values = values + "(" + betID + ", " + postID + ");"
              //if neither first or last index
            } else {
              values = values + "(" + betID + ", " + postID + "), "
            }
          });

          let pbSql = "INSERT INTO post_bets (intBetID, intPostID) " + values;

          connection.query(pbSql, function (err, result) {
            connection.release();
            if (!err) {
              res.json("success");
            } else {
              console.log(err)
            }
          });
        }else{
          res.json("success");
          connection.release();
        }

      } else {
        console.log(err);
        connection.release();
      }
    });

    connection.on('error', function (err) {
      connection.release();
      res.json({ "code": 100, "status": "Error in database connection" });
    })
  })
};

function getAccountPosts(req, res) {
  pool.getConnection(function (err, connection) {
    if (err) {
      connection.release();
      res.json({ "code": 100, "status": "Error in database connection" });
      return;
    }
    console.log("connected as id: " + connection.threadId);

    let sql = "SELECT  p.*, bets.intBetID, bets.jsonBet, legs.jsonLeg FROM posts AS p " +
      "LEFT JOIN post_bets AS pb ON pb.intPostID = p.intPostID " +
      "LEFT JOIN personal_bets AS bets ON bets.intBetID = pb.intBetID " +
      "LEFT JOIN personal_bet_legs AS legs ON legs.intBetID = bets.intBetID " +
      "WHERE p.intAccountID = ?;"

    let ID = req.query.ID;

    connection.query(sql, ID, function (err, rows) {
      connection.release();
      if (!err) {
        let posts = formatPosts(rows);
        res.json(posts)
      } else {
        console.log(err)
      }
    });

    connection.on('error', function (err) {
      connection.release();
      res.json({ "code": 100, "status": "Error in database connection" });
    })
  })
}

router.post('/create', function (req, res) {
  createPost(req, res);
});

router.get('/byAccount', function (req, res) {
  getAccountPosts(req, res);
});

module.exports = router;