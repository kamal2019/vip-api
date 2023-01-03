const Joi = require('joi');
const { objectId, image } = require('./custom.validation');

const createParticipation = {
  FormData: Joi.object().keys({
    userId: Joi.string().custom(objectId).required(),
    postId: Joi.string().custom(objectId).required(),
    image: Joi.custom(image).required(),
  }),
};

const updateParticipation = {
  body: Joi.object().keys({
    status: Joi.string().valid('accepted', 'rejected', 'pending').required(),
  }),
  params: Joi.object().keys({
    participationId: Joi.string().custom(objectId).required(),
  }),
};

const getParticipationsByPostId = {
  params: Joi.object().keys({
    postId: Joi.string().custom(objectId).required(),
  }),
};

const getParticipationByUserId = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId).required(),
  }),
};

const getParticipationById = {
  params: Joi.object().keys({
    participationId: Joi.string().custom(objectId).required(),
  }),
};

const deleteParticipationById = {
  params: Joi.object().keys({
    participationId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createParticipation,
  updateParticipation,
  getParticipationsByPostId,
  getParticipationByUserId,
  getParticipationById,
  deleteParticipationById,
};
