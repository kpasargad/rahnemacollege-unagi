'use strict';
module.exports = function(app) {
  var unagi = require('../controllers/unagiController');


  // unagi Routes
  app.route('/posts')
    .get(unagi.list_all_posts)
    .post(unagi.create_a_post);


  app.route('/posts/:postId')
    .get(unagi.read_a_post)
    .put(unagi.update_a_post)
    .delete(unagi.delete_a_post);
};