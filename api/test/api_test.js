var request = require('supertest');
var assert = require('assert');
var app = require('../app');

describe('GET /api/v1/poem_theme', function(done) {
  it('returns 400 if id is not integer ', function(done){
    request(app)
    .get('/api/v1/poem_theme/aaa')
    .expect(400, done);
  });

  it('returns 404 if item for id not found', function(done){
    request(app)
    .get('/api/v1/poem_theme/10000')
    .expect(404, done);
  });

  it('returns 200 if parameters are valid', function(done){
    request(app)
    .get('/api/v1/poem_theme/1')
    .expect('Content-Type', 'application/json; charset=utf-8')
    .expect(200, done);
  });
});

//describe('GET /api/v1/poem_themes', function(done) {
//  var agent = request.agent("http://localhost:3000") ;
//  it('returns 400 if parameter is incorrect', function(done){
//    agent
//    .post('/api/v1/poem_theme/create')
//    .send({"title":200, "ntag":4, "detail":"detail", "answer_length_min":100, "answer_length_max":200, "theme_setter_name":"user"})
//    .expect(400, done);
//  });
//
//  it('returns 200 if parameters are valid', function(done){
//    request(app)
//    .post('/api/v1/poem_theme/create')
//    .send({"title":"aaa", "ntag":4, "detail":"detail", "answer_length_min":100, "answer_length_max":200, "theme_setter_name":"user"})
//    .expect(200, done);
//  });
//});

describe('POST /api/v1/poem_theme/create', function(done) {
  //it('returns 400 if title is digits only', function(done){
  //  request(app)
  //  .post('/api/v1/poem_theme/create')
  //  .send({"title":200, "ntag":"aaaa", "detail":"detail", "answer_length_min":100, "answer_length_max":200, "theme_setter_name":"user"})
  //  .expect(400, done);
  //});

  it('returns 400 if parameter is incorrect', function(done){
    request(app)
    .post('/api/v1/poem_theme/create')
    .send({"title":200, "ntag":"aaaa", "detail":"detail", "answer_length_min":100, "answer_length_max":200, "theme_setter_name":"user"})
    .expect(400, done);
  });

  it('returns 200 if parameters are valid', function(done){
    request(app)
    .post('/api/v1/poem_theme/create')
    .send({"title":"aaa", "ntag":4, "detail":"detail", "answer_length_min":100, "answer_length_max":200, "theme_setter_name":"user"})
    .expect(200, done);
  });
});
