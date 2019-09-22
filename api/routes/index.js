const config = require('../lib/config');
var express = require('express');
var router = express.Router();
var { Client } = require('pg');
var mysql = require('mysql');

//var client = new Client({
//  host: 'localhost',
//  user: config.db_username,
//  database: config.db_name,
//  password: config.db_password,
//  port: config.db_port
//});

var client = mysql.createConnection({
  host: 'localhost',
  user: config.db_username,
  database: config.db_name,
  password: config.db_password,
  port: 3306
});

client.connect(err => {
  if (err) {
    console.log(err.stack);
    return;
  }
});

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// API for poem_theme and tag and poem at sametime
router.post('/api/v1/compe/launch', async function(req, res, next) {
  const request_json = req.body;
  const poemTheme = request_json["poem_theme"];
  const poemTags = request_json["poem_tags"];
  const poem = request_json["poem"];
  //const poem = request_json["poem_tags"];

  const title = poemTheme['title'];
  const detail = poemTheme['detail'];
  const ntag = poemTheme['ntag'];
  const answer_length_min = poemTheme['answer_length_min'];
  const answer_length_max = poemTheme['answer_length_max'];
  const theme_setter_name = poemTheme['theme_setter_name'];

  const answererName = poem['answerer_name'];
  const answerText = poem['answer_text'];

  const npoem = 1;
  const poemThemeQueryText = "INSERT INTO poem_theme SET ?;";
  const poemThemeQueryParams = {
      title: title, ntag: ntag, detail: detail,
      answer_length_min: answer_length_min,
      answer_length_max:answer_length_max,
      theme_setter_name: theme_setter_name, npoem: npoem };

  const poemTagQueryText = "INSERT INTO poem_tag (tag, poem_theme_id)"
      + " VALUES ?;";
  const poemQueryText = "INSERT INTO poem SET ?;";

  client.beginTransaction( err => {
    if (err) {
      console.log(err);
      res.status(500).send({error: 'Internal Server Error'});
    }
    client.query(poemThemeQueryText, poemThemeQueryParams,
      (err, result, fields) => {
        if (err) {
          console.log(err);
          res.status(400).send({error: 'Bad Request'});
        } else {
          const poemThemeId = result.insertId;
          var poemTagObjList = [];
          for (var i = 0; i < poemTags.length; i ++) {
            poemTagObjList.push([poemTags[i].tag, poemThemeId]);
          }
          client.query(poemTagQueryText, [poemTagObjList],
            (err, result, fields) => {
              if (err) {
                console.log(err);
                res.status(400).send({error: 'Bad Request'});
              } else {
                const poemQueryParams = {
                  nfav: 0, answerer_name: answererName, answer_text: answerText,
                  poem_theme_id: poemThemeId
                }
                client.query(poemQueryText, poemQueryParams,
                  (err, result, fields) => {
                    if (err) {
                      console.log(err);
                      res.status(400).send({error: 'Bad Request'});
                    } else {
                      client.commit(err => {
                        if (err) {
                          console.log(err);
                          res.status(500).send({error: 'Internal Server Error'});
                        } else {
                          res.status(200).send('OK');
                        }
                      });
                    }
                  })
              }
            })
        }
      })
  });
});

// API for poem_theme
router.get('/api/v1/poem_themes', function(req, res, next) {
  var order = "date";
  var dataOrder = "created_at";
  if (req.query.order) {
    order = req.query
  }
  switch (order) {
    case "fav":
      dataOrder = "npoem"
    default:
      dataOrder = "created_at"
  }
  const queryText = "select * from poem_theme order by ?;";
  const queryParams = [dataOrder];

  client.query(queryText, queryParams, (err, result, fields) => {
    if (err) {
      res.status(400).send({error: 'Bad Request'});
    } else {
      res.status(200).json(result);
    }
  });
});

router.get('/api/v1/poem_theme/:id', function(req, res, next) {
  var id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).send({error: 'Bad Request'});
  }
  const queryText = "select * from poem_theme where id = ?;";
  const queryParam = [id];

  client.query(queryText, queryParam, (err, result, fields) => {
    if (err) {
      return res.status(400).send({error: 'Bad Request'});
    } else if (result.length == 0) {
      return res.status(404).send({error: 'Not Found'});
    } else {
      return res.status(200).json(result[0]);
    }
  });
});

router.post('/api/v1/poem_theme/create', function(req, res, next) {
  const request_json = req.body;
  const title = request_json['title'];
  const detail = request_json['detail'];
  const ntag = request_json['ntag'];
  const answer_length_min = request_json['answer_length_min'];
  const answer_length_max = request_json['answer_length_max'];
  const theme_setter_name = request_json['theme_setter_name'];
  const npoem = 1;
  const queryText = "INSERT INTO poem_theme SET ?;";
  const queryParam = {
    title: title, ntag: ntag, detail: detail,
    answer_length_min: answer_length_min,
    answer_length_max: answer_length_max,
    theme_setter_name: theme_setter_name, npoem: npoem
  }

  client.query(queryText, queryParam, (err, results, fields) => {
    if (err) {
      res.status(400).send({error: 'Bad Request'});
    } else {
      res.status(200).send('OK');
    }
  });
});


// API for poem
//router.get('/api/v1/poem_theme/:theme_id/poems', function(req, res, next) {
//  var themeId = Number(req.params.theme_id);
//  if (!Number.isInteger(themeId)) {
//    res.status(400).send({error: 'Bad Request'});
//  }
//  const query = {
//    text: "select * from poem where poem_theme_id = $1;",
//    values: [themeId]
//  };
//  client.query(query)
//    .then(r => {
//      if (r.rows.length == 0) {
//        return res.status(404).send({error: 'Not Found'});
//      }
//      //res.json(r.rows[0]);
//      return res.status(200).json(r.rows[0]);
//    })
//    .catch(err => {
//      console.log(err);
//      return res.status(400).send({error: 'Bad Request'});
//  });
//});

//router.get('/api/v1/poem/:id', function(req, res, next) {
//  var id = Number(req.params.id);
//  if (!Number.isInteger(id)) {
//    res.status(400).send({error: 'Bad Request'});
//  }
//  const query = {
//    text: "select * from poem where id = $1;",
//    values: [id]
//  };
//  client.query(query)
//    .then(r => {
//      if (r.rows.length == 0) {
//        return res.status(404).send({error: 'Not Found'});
//      }
//      //res.json(r.rows[0]);
//      return res.status(200).json(r.rows[0]);
//    })
//    .catch(err => {
//      console.log(err);
//      return res.status(400).send({error: 'Bad Request'});
//  });
//});

router.post('/api/v1/poem/create', function(req, res, next) {
  const request_json = req.body;
  const answererText = request_json['answer_text'];
  const answererName = request_json['answerer_name'];
  const poemThemeId = request_json['poem_theme_id'];
  const nfav = 0;
  const queryText = "INSERT INTO poem SET ?";
  const queryParams = {
    nfav: nfav, answer_text: answererText, answerer_name: answererName,
    poem_theme_id: poemThemeId
  }
  client.query(queryText, queryParams, (err, result, fields) => {
    if (err) {
      res.status(400).send({error: 'Bad Request'});
    } else {
      res.status(200).send('OK');
    }
  });
});
//curl -X POST -H "Content-Type: application/json" http://localhost:3000/api/v1/poem/create -d '{"answer_text":'aaa', "answerer_name":"ojisan", "poem_theme_id":1}'


// API for poem_tag
//router.get('/api/v1/poem_theme/:theme_id/poem_tags', function(req, res, next) {
//  var themeId = Number(req.params.theme_id);
//  if (!Number.isInteger(themeId)) {
//    res.status(400).send({error: 'Bad Request'});
//  }
//  const query = {
//    text: "select * from poem_tag where poem_theme_id = $1;",
//    values: [themeId]
//  };
//  client.query(query)
//    .then(r => {
//      if (r.rows.length == 0) {
//        return res.status(404).send({error: 'Not Found'});
//      }
//      return res.status(200).json(r.rows[0]);
//    })
//    .catch(err => {
//      console.log(err);
//      return res.status(400).send({error: 'Bad Request'});
//  });
//});
//
//router.get('/api/v1/poem_tag/:id', function(req, res, next) {
//  var id = Number(req.params.id);
//  if (!Number.isInteger(id)) {
//    res.status(400).send({error: 'Bad Request'});
//  }
//  const query = {
//    text: "select * from poem_tag where id = $1;",
//    values: [id]
//  };
//  client.query(query)
//    .then(r => {
//      if (r.rows.length == 0) {
//        return res.status(404).send({error: 'Not Found'});
//      }
//      return res.status(200).json(r.rows[0]);
//    })
//    .catch(err => {
//      console.log(err);
//      return res.status(400).send({error: 'Bad Request'});
//  });
//});
//
//router.post('/api/v1/poem_tag/create', function(req, res, next) {
//  const request_json = req.body;
//  const nfav = 0;
//  const tag = request_json['tag'];
//  const poemThemeId = request_json['poem_theme_id'];
//  const query = {
//    text: "INSERT INTO poem_tag (tag, poem_theme_id, nfav)\
//      VALUES ($1, $2, $3);",
//    values: [tag, poemThemeId, nfav]
//  };
//  client.query(query)
//    .then(r => {
//      if (r.rows.length == 0) {
//        return res.status(404).send({error: 'Not Found'});
//      }
//      return res.status(200).json(r.rows[0]);
//    })
//    .catch(err => {
//      console.log(err);
//      return res.status(400).send({error: 'Bad Request'});
//  });
//});

module.exports = router;
