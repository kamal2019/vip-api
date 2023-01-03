const Joi = require('joi');
const { objectId, image } = require('./custom.validation');

const createCertificate = {
  body: Joi.object().keys({
    givenTo: Joi.string().custom(objectId).required(),
    givenBy: Joi.string().custom(objectId).required(),
    givenFor: Joi.string().custom(objectId).required(),
    image: Joi.custom(image),
  }),
};

const getCertificatesByUserId = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId).required(),
  }),
};

const getCertificatesByAdminId = {
  params: Joi.object().keys({
    adminId: Joi.string().custom(objectId).required(),
  }),
};

const getCertificateById = {
  params: Joi.object().keys({
    certificateId: Joi.string().custom(objectId).required(),
  }),
};

const deleteCertificate = {
  params: Joi.object().keys({
    certificateId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createCertificate,
  deleteCertificate,
  getCertificatesByUserId,
  getCertificatesByAdminId,
  getCertificateById,
};
