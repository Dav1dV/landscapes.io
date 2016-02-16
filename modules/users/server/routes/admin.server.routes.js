'use strict';

/**
 * Module dependencies
 */
var adminPolicy = require('../policies/admin.server.policy'),
    path = require('path'),
    landscapesPolicy = require(path.resolve('./modules/landscapes/server/policies/landscapes.server.policy')),
    admin = require('../controllers/admin.server.controller'),
    group = require('../controllers/groups.server.controller'),
    role = require('../controllers/roles.server.controller');

module.exports = function (app) {
  // User route registration first. Ref: #713
  require('./users.server.routes.js')(app);

  // Users collection routes
  app.route('/api/users').all(landscapesPolicy.isAllowed)
      .post(admin.save)
    .get(admin.list);

  // Single user routes
  app.route('/api/users/:userId').all(landscapesPolicy.isAllowed)
    .get(admin.read)
    .put(admin.update)
    .delete(admin.delete);

  // Finish by binding the user middleware
  app.param('userId', admin.userByID);
  
  //Role Routes
  
  //Group Routes
  
  
};