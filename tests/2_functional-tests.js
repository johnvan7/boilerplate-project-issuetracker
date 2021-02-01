const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  let projectId;

  suite('Routing Tests', function() {

    suite('POST /api/issues/{project} => issue object', function() {

      test('Create an issue with every field', function(done) {
       chai.request(server)
        .post('/api/issues/apitest')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({
          issue_title: 'testIssue090',
          issue_text: 'testText090',
          created_by: 'testUser090',
          assigned_to: 'Joe',
          status_text: 'testStatus090'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          projectId = res.body._id;
          assert.ok(res.body._id);
          assert.equal(res.body.issue_title, 'testIssue090');
          assert.equal(res.body.issue_text, 'testText090');
          assert.equal(res.body.created_by, 'testUser090');
          assert.equal(res.body.assigned_to, 'Joe');
          assert.equal(res.body.status_text, 'testStatus090');
          assert.ok(res.body.created_on)
          assert.ok(res.body.updated_on)
          done();
        });
      });

      test('Create an issue with only required fields', function(done) {
       chai.request(server)
        .post('/api/issues/apitest')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({
          issue_title: 'testIssue090',
          issue_text: 'testText090',
          created_by: 'testUser090',
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.ok(res.body._id);
          assert.equal(res.body.issue_title, 'testIssue090');
          assert.equal(res.body.issue_text, 'testText090');
          assert.equal(res.body.created_by, 'testUser090');
          assert.ok(res.body.created_on)
          assert.ok(res.body.updated_on)
          done();
        });
      });

      test('Create an issue with missing required fields', function(done) {
       chai.request(server)
        .post('/api/issues/apitest')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({
          issue_title: 'testIssue090',
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'required field(s) missing');
          done();
        });
      });
    });

    suite('GET /api/issues/{project} => array of issue objects', function() {

      test('View issues on a project', function(done) {
       chai.request(server)
        .get('/api/issues/apitest')
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          done();
        });
      });

      test('View issues on a project with one filter', function(done) {
       chai.request(server)
        .get('/api/issues/apitest')
        .query({open: true})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          res.body.forEach(elem => {
            assert.equal(elem.open, true)
          });
          done();
        });
      });

      test('View issues on a project with multiple filters', function(done) {
       chai.request(server)
        .get('/api/issues/apitest')
        .query({open: true, assigned_to: "Joe"})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          res.body.forEach(elem => {
            assert.equal(elem.open, true)
            assert.equal(elem.assigned_to, "Joe")
          });
          done();
        });
      });

    });

    suite('PUT /api/issues/{project} => result object', function() {

      test('Update one field on an issue', function(done) {
       chai.request(server)
        .put('/api/issues/apitest')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({
          _id: projectId, 
          open: false
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body.result, "successfully updated")
          assert.equal(res.body._id, projectId)

          done();
        });
      });

      test('Update multiple fields on an issue', function(done) {
       chai.request(server)
        .put('/api/issues/apitest')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({
          _id: projectId, 
          open: false,
          assigned_to: "Jiuan"
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          //assert.equal(res.type, 'application/json');
          assert.equal(res.body.result, "successfully updated")
          assert.equal(res.body._id, projectId)
          done();
        });
      });

      test('Update an issue with missing _id', function(done) {
       chai.request(server)
        .put('/api/issues/apitest')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({ 
          open: false
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body.error, "missing _id")
          done();
        });
      });

      test('Update an issue with no fields to update', function(done) {
       chai.request(server)
        .put('/api/issues/apitest')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({
          _id: projectId
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body.error, "no update field(s) sent")
          assert.equal(res.body._id, projectId)
          done();
        });
      });

      test('Update an issue with an invalid _id', function(done) {
       chai.request(server)
        .put('/api/issues/apitest')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({
          _id: "invalid_id",
          open: false,
          assigned_to: "Jiuan"
        })
        .end(function(err, res){
          assert.equal(res.status, 500);
          done();
        });
      });

    });

    suite('DELETE /api/issues/{project} => result object', function() {

      test('Delete an issue', function(done) {
       chai.request(server)
        .delete('/api/issues/apitest')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({
          _id: projectId
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body.result, "successfully deleted")
          assert.equal(res.body._id, projectId)
          done();
        });
      });

      test('Delete an issue with an invalid _id', function(done) {
       chai.request(server)
        .delete('/api/issues/apitest')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({
          _id: "invalid_id"
        })
        .end(function(err, res){
          assert.equal(res.status, 500);
          done();
        });
      });

      test('Delete an issue with missing _id', function(done) {
       chai.request(server)
        .delete('/api/issues/apitest')
        .set('content-type', 'application/x-www-form-urlencoded')
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body.error, "missing _id")
          done();
        });
      });

    });

  });

});
