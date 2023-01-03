const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { postService } = require('../services');

const createPost = catchAsync(async (req, res) => {
  const post = await postService.createPost(req);
  res.status(httpStatus.CREATED).send(post);
});

const getPosts = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['title', 'views', 'content', 'likesCount']);
  const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);
  const result = await postService.queryPosts(filter, options);
  res.status(httpStatus.OK).send(result);
});

const searchPosts = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);
  const result = await postService.searchPosts(req.body.searchTerm, options);
  res.status(httpStatus.OK).send(result);
});

const getPostById = catchAsync(async (req, res) => {
  const post = await postService.getPostById(req.params.postId);
  res.status(httpStatus.OK).send(post);
});

const getPostByUserId = catchAsync(async (req, res) => {
  const posts = await postService.getPostByUserId(req.params.userId);
  res.status(httpStatus.OK).send(posts);
});

const updatePostById = catchAsync(async (req, res) => {
  const post = await postService.updatePostById(req.params.postId, req);
  res.status(httpStatus.OK).send(post);
});

const deletePostById = catchAsync(async (req, res) => {
  await postService.deletePostById(req.params.postId);
  res.status(httpStatus.NO_CONTENT).send();
});

const likePost = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { postId } = req.params;
  const post = await postService.likePost(userId, postId);
  res.status(httpStatus.OK).send(post);
});

const unlikePost = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { postId } = req.params;
  const post = await postService.unlikePost(userId, postId);
  res.status(httpStatus.OK).send(post);
});

module.exports = {
  createPost,
  getPosts,
  searchPosts,
  getPostById,
  getPostByUserId,
  updatePostById,
  deletePostById,
  likePost,
  unlikePost,
};
