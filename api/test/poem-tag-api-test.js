var request = require('supertest');
var assert = require('assert');
var app = require('../app');

describe('GET /api/v1/poem_tag/:id', function(done) {
  it('returns 400 if id is not integer ', function(done){
    request(app)
    .get('/api/v1/poem_tag/aaa')
    .expect(400)
    .end(done);
  });

  it('returns 404 if item for id not found', function(done){
    request(app)
    .get('/api/v1/poem_tag/111111')
    .expect(404)
    .end(done);
  });

  it('returns 200 if parameters are valid', function(done){
    request(app)
    .get('/api/v1/poem_tag/19')
    .expect('Content-Type', 'application/json; charset=utf-8')
    .expect(200)
    .end(done);
  });
});

describe('POST /api/v1/poem_tag/create', function(done) {
  it('returns 400 if poem_theme for poem_theme_id does not exist ', function(done){
    request(app)
    .post('/api/v1/poem_tag/create')
    .send({"tag": "夏について", "poem_theme_id": 100})
    .expect(400)
    .end(done);
  });

  it('returns 200 if parameters are valid', function(done){
    request(app)
    .post('/api/v1/poem_tag/create')
    .send({"tag": "夏について", "poem_theme_id": 1})
    .expect('Content-Type', 'application/json; charset=utf-8')
    .expect(200)
    .end(done);
  });
});