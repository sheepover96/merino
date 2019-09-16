const config = require('../lib/config');
var express = require('express');
var router = express.Router();
var { Client } = require('pg');

var client = new Client({
  user: config.db_username,
  database: config.db_name,
  password: config.db_password,
  port: config.db_port
});

client.connect();

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
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
  const query = {
    text: "select * from poem_theme order by $1;",
    values: [dataOrder]
  };
  client.query(query)
    .then(r => {
      res.json(r.rows)
      res.status(200).send('OK');
    })
    .catch(err => {
      res.status(400).send({error: 'Bad Request'});
    });
}); 

router.get('/api/v1/poem_theme/:id', function(req, res, next) {
  var id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).send({error: 'Bad Request'});
  }
  const query = {
    text: "select * from poem_theme where id = $1;",
    values: [id]
  };
  client.query(query)
    .then(r => {
      if (r.rows.length == 0) {
        return res.status(404).send({error: 'Not Found'});
      }
      //res.json(r.rows[0]);
      return res.status(200).json(r.rows[0]);
    })
    .catch(err => {
      console.log(err);
      return res.status(400).send({error: 'Bad Request'});
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
  const query = {
    text: "INSERT INTO poem_theme (title, ntag, detail,\
      answer_length_min, answer_length_max, theme_setter_name, npoem)\
      VALUES ($1, $2, $3, $4, $5, $6, $7);",
    values: [title, ntag, detail, answer_length_min,
      answer_length_max, theme_setter_name, npoem]
    };
  client.query(query)
    .then(r => {
      res.status(200).send('OK');
    })
    .catch(err => {
      console.log(err);
      res.status(400).send({error: 'Bad Request'});
    });
}); 


// API for poem
router.get('/api/v1/poem_theme/:theme_id/poems', function(req, res, next) {
  var themeId = Number(req.params.theme_id);
  if (!Number.isInteger(themeId)) {
    res.status(400).send({error: 'Bad Request'});
  }
  const query = {
    text: "select * from poem where poem_theme_id = $1;",
    values: [themeId]
  };
  client.query(query)
    .then(r => {
      if (r.rows.length == 0) {
        return res.status(404).send({error: 'Not Found'});
      }
      //res.json(r.rows[0]);
      return res.status(200).json(r.rows[0]);
    })
    .catch(err => {
      console.log(err);
      return res.status(400).send({error: 'Bad Request'});
  });
}); 

router.get('/api/v1/poem/:id', function(req, res, next) {
  var id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).send({error: 'Bad Request'});
  }
  const query = {
    text: "select * from poem where id = $1;",
    values: [id]
  };
  client.query(query)
    .then(r => {
      if (r.rows.length == 0) {
        return res.status(404).send({error: 'Not Found'});
      }
      //res.json(r.rows[0]);
      return res.status(200).json(r.rows[0]);
    })
    .catch(err => {
      console.log(err);
      return res.status(400).send({error: 'Bad Request'});
  });
}); 

router.post('/api/v1/poem/create', function(req, res, next) {
  const request_json = req.body;
  const answererText = request_json['answer_text'];
  const answererName = request_json['answerer_name'];
  const poemThemeId = request_json['poem_theme_id'];
  const nfav = 0;
  const query = {
    text: "INSERT INTO poem (nfav, answer_text, answerer_name,\
      poem_theme_id) VALUES ($1, $2, $3, $4);",
    values: [nfav, answererText, answererName, poemThemeId]
    };
  client.query(query)
    .then(r => {
      res.status(200).send('OK');
    })
    .catch(err => {
      res.status(400).send({error: 'Bad Request'});
    });
}); 

module.exports = router;
