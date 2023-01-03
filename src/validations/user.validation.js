const Joi = require('joi');
const { password, objectId, image } = require('./custom.validation');

const createUser = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    phone: Joi.string()
      .required()
      .regex(/^[0-9]{10}$/)
      .messages({
        'string.pattern.base': 'Phone number must be 10 digits and only numbers',
      }),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
    role: Joi.string().required().valid('user', 'admin'),
    bio: Joi.string().max(500),
    coins: Joi.number().integer().min(0),
    averageRating: Joi.number().integer().min(0),
  }),
};

const getUsers = {
  query: Joi.object().keys({
    name: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      phone: Joi.string().regex(/^[0-9]{10}$/),
      name: Joi.string(),
      bio: Joi.string().max(500),
      profilePic: Joi.custom(image),
    })
    .min(1),
};

const updateUserSpecial = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  FormData: Joi.object()
    .keys({
      name: Joi.string(),
      email: Joi.string().email(),
      phone: Joi.string().regex(/^[0-9]{10}$/),
      isEmailVerified: Joi.string().valid('true', 'false'),
      bio: Joi.string(),
      role: Joi.string().valid('user', 'admin'),
      coins: Joi.number().integer().min(0),
      averageRating: Joi.number().integer().min(0),
      profilePic: Joi.custom(image),
    })
    .min(1),
};

const popNotification = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
    notificationId: Joi.required().custom(objectId),
  }),
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const updateProfilePic = {
  FormData: Joi.object().keys({
    profilePic: Joi.custom(image).required(),
  }),
};

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  updateUserSpecial,
  popNotification,
  deleteUser,
  updateProfilePic,
};
