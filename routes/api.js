'use strict';
var ObjectID = require('mongodb').ObjectID;

module.exports = function (app, myDataBase) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let projectName = req.params.project;
      if(!projectName)
        return res.json({ error: 'required field(s) missing' })
      let filter = {}

      if(req.query._id){
        filter._id = ObjectID(req.query._id) 
      }
      if(req.query.issue_title)
        filter.issue_title = req.query.issue_title

      if(req.query.issue_text)
        filter.issue_text = req.query.issue_text

      if(req.query.created_by)
        filter.created_by = req.query.created_by

      if(req.query.assigned_to)
        filter.assigned_to = req.query.assigned_to

      if(req.query.status_text)
        filter.status_text = req.query.status_text

      if(req.query.open != undefined)
        filter.open = req.query.open

      myDataBase.collection(projectName).find(filter).toArray((err, docs) => {
        if (err) throw err;
        return res.json(docs)
      })
    })
    
    .post(function (req, res){
      let projectName = req.params.project;
      if(!projectName || !req.body.issue_title|| !req.body.issue_text|| !req.body.created_by){
        return res.json({ error: 'required field(s) missing' })
      }

      const {issue_title, issue_text, created_by, assigned_to, status_text} = req.body
      
      const issue = {
          issue_title,
          issue_text,
          created_by,
          created_on  : new Date(),
          updated_on  : new Date(),
          assigned_to : assigned_to || '',
          status_text : status_text || '',
          open        : true
        };

      myDataBase.collection(projectName).insertOne(issue, (err, doc) => {
            if (err) {
              throw err;
            } else {
              return res.json(doc.ops[0])
            }
      });
    })
    
    .put(function (req, res){
      let projectName = req.params.project;
      let issueId = req.body._id
      if(!projectName){
        return res.json({ error: 'required field(s) missing' })
      }
      if(!issueId){
        return res.json({ error: 'missing _id' })
      }
      if(Object.keys(req.body).length<=1){
        return res.json({ error: 'no update field(s) sent', _id: issueId })
      }

      let issue = {updated_on: new Date()}

      if(req.body.issue_title)
        issue.issue_title = req.body.issue_title

      if(req.body.issue_text)
        issue.issue_text = req.body.issue_text

      if(req.body.created_by)
        issue.created_by = req.body.created_by

      if(req.body.assigned_to)
        issue.assigned_to = req.body.assigned_to

      if(req.body.status_text)
        issue.status_text = req.body.status_text

      if(req.body.open != undefined)
        issue.open = req.body.open

      myDataBase.collection(projectName).updateOne({'_id': ObjectID(issueId)}, {$set: issue}, function(err, doc) {
        if (err) throw err;
        if(doc.result.n){
          return res.json({result: 'successfully updated', '_id': issueId})
        } else {
          return res.json({ error: 'could not update', _id: issueId })
        }
      });
    })
    
    .delete(function (req, res){
      let projectName = req.params.project;
      if(!projectName)
        return res.json({ error: 'required field(s) missing' })
      let issueId = req.body._id
      if(!issueId)
        return res.json({ error: 'missing _id' })
      myDataBase.collection(projectName).deleteOne({'_id': ObjectID(issueId)}, function(err, doc) {
        if (err) throw err;
        if(doc.deletedCount){
          return res.json({result: 'successfully deleted', _id: issueId})
        } else {
          return res.json({ error: 'could not delete', _id: issueId })
        }
      });
    });
    
};
