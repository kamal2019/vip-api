const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const postValidation = require('../../validations/post.validation');
const postController = require('../../controllers/post.controller');

const router = express.Router();

router
  .route('/')
  .get(validate(postValidation.getPosts), postController.getPosts)
  .post(auth('managePosts'), validate(postValidation.createPost), postController.createPost);

router.route('/search').post(validate(postValidation.searchPosts), postController.searchPosts);

router
  .route('/:postId')
  .get(validate(postValidation.getPost), postController.getPostById)
  .patch(auth('managePosts'), validate(postValidation.updatePost), postController.updatePostById)
  .delete(auth('managePosts'), validate(postValidation.deletePost), postController.deletePostById);

router.route('/user/:userId').get(validate(postValidation.getPostByUserId), postController.getPostByUserId);

router.route('/like/:postId').post(auth('manageLike'), validate(postValidation.likePost), postController.likePost);
router.route('/unlike/:postId').post(auth('manageLike'), validate(postValidation.unlikePost), postController.unlikePost);

module.exports = router;
