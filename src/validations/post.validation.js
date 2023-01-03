const Joi = require('joi');
const { objectId, image } = require('./custom.validation');

const createPost = {
  FormData: Joi.object().keys({
    title: Joi.string().required(),
    content: Joi.string().required(),
    authorId: Joi.string().custom(objectId).required(),
    maxParticipants: Joi.number().required(),
    date: Joi.string().required(),
    time: Joi.string().required(),
    venue: Joi.string().required(),
    image: Joi.custom(image).required(),
    views: Joi.number().integer().min(0),
    likes: Joi.array().items(Joi.string().custom(objectId)),
  }),
};

const getPosts = {
  query: Joi.object().keys({
    title: Joi.string(),
    views: Joi.number().integer().min(0),
    content: Joi.string(),
    likesCount: Joi.number().integer().min(0),
    sortBy: Joi.string(),
    populate: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const searchPosts = {
  FormData: Joi.object().keys({
    searchTerm: Joi.string().required(),
  }),
  params: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer().min(1).max(100),
    page: Joi.number().integer().min(1),
  }),
};

const getPost = {
  params: Joi.object().keys({
    postId: Joi.string().custom(objectId),
  }),
};

const getPostByUserId = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const likePost = {
  params: Joi.object().keys({
    postId: Joi.string().custom(objectId),
  }),
};

const unlikePost = {
  params: Joi.object().keys({
    postId: Joi.string().custom(objectId),
  }),
};

const updatePost = {
  params: Joi.object().keys({
    postId: Joi.string().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      title: Joi.string(),
      content: Joi.string(),
      authorId: Joi.string().custom(objectId).required(),
      maxParticipants: Joi.number().required(),
      date: Joi.string(),
      time: Joi.string(),
      venue: Joi.string(),
      image: Joi.custom(image),
      views: Joi.number().integer().min(0),
      likes: Joi.array().items(Joi.string().custom(objectId)),
    })
    .min(1),
};

const deletePost = {
  params: Joi.object().keys({
    postId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createPost,
  getPost,
  searchPosts,
  likePost,
  unlikePost,
  getPosts,
  getPostByUserId,
  updatePost,
  deletePost,
};
