/* eslint-disable security/detect-non-literal-fs-filename */
const path = require('path');
const fs = require('fs');

const httpStatus = require('http-status');
const { Post } = require('../models');
const ApiError = require('../utils/ApiError');

const isImageValid = (image, authorId, oldName) => {
  // Check if file was uploaded
  if (!image) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No file was uploaded');
  }
  // Check if file is an image
  if (!image.mimetype.startsWith('image')) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'File must be an image');
  }
  // Check file size
  if (image.size > process.env.MAX_FILE_UPLOAD_SIZE) {
    throw new ApiError(httpStatus.BAD_REQUEST, `File must be less than ${process.env.MAX_FILE_UPLOAD_SIZE / 1000000}MB`);
  }

  if (oldName) {
    // Delete old image from disk
    const filePath = path.join(process.env.UPLOAD_PATH, oldName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
  // Create unique filename
  const newName = `post_image_${authorId}_${Date.now().toString()}${path.extname(image.name)}`;

  // Save file to disk
  image.mv(path.join(process.env.UPLOAD_PATH, newName), async (err) => {
    if (err) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error saving file');
    }
  });
  return newName;
};

/**
 * Create a post
 * @param {Object} req
 * @returns {Promise<Post>}
 */
const createPost = async (req) => {
  const { files } = req;
  req.body.image = isImageValid(files.image, req.body.authorId);
  return Post.create(req.body);
};

/**
 * Query for posts
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryPosts = async (filter, options) => {
  return Post.paginate(filter, options);
};

/**
 * Get all posts by author id
 * @param {Object} userId
 * @returns {Promise<Post>}
 */

const getPostByUserId = async (userId) => {
  return Post.find({ authorId: userId });
};

/**
 * Search posts by title or content or venue
 * @param {string} searchTerm
 * @param {Object} options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 * */
const searchPosts = async (searchTerm, options) => {
  const filter = {
    $or: [
      { title: { $regex: searchTerm, $options: 'i' } },
      { content: { $regex: searchTerm, $options: 'i' } },
      { venue: { $regex: searchTerm, $options: 'i' } },
    ],
  };
  return Post.paginate(filter, options);
};

/**
 * Get post by id
 * @param {ObjectId} id
 * @returns {Promise<Post>}
 */
const getPostById = async (id) => {
  return Post.findById(id);
};

/**
 * Like post by id
 * @param {ObjectId} postId
 * @param {ObjectId} userId
 * @throws {ApiError}
 * @returns {Promise<Post>}
 */
const likePost = async (userId, postId) => {
  const post = await getPostById(postId);
  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }
  return post.like(userId);
};

/**
 * Unlike post by id
 * @param {ObjectId} userId
 * @param {ObjectId} postId
 * @throws {ApiError}
 * @returns {Promise<Post>}
 */
const unlikePost = async (userId, postId) => {
  const post = await getPostById(postId);
  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }
  return post.unlike(userId);
};

/**
 * Update post by id
 * @param {ObjectId} postId
 * @param {Object} req
 * @throws {ApiError}
 * @returns {Promise<Post>}
 *
 */
const updatePostById = async (postId, req) => {
  const post = await getPostById(postId);
  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }
  if (req.files) {
    const { files } = req;
    req.body.image = isImageValid(files.image, req.body.authorId, post.image);
  }
  return Post.findByIdAndUpdate(postId, req.body, { new: true });
};

/**
 * Delete post by id
 * @param {ObjectId} postId
 * @throws {ApiError}
 * @returns {Promise<Post>}
 *
 */
const deletePostById = async (postId) => {
  const post = await getPostById(postId);
  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }
  // Delete image from disk
  const filePath = path.join(process.env.UPLOAD_PATH, post.image);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  await post.remove();
  return post;
};

module.exports = {
  createPost,
  queryPosts,
  searchPosts,
  getPostById,
  getPostByUserId,
  likePost,
  unlikePost,
  updatePostById,
  deletePostById,
};
