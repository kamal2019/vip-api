const path = require('path');
const fs = require('fs');

const httpStatus = require('http-status');
const { Certificate } = require('../models');
const ApiError = require('../utils/ApiError');

const isImageValid = (image, givenFor, givenTo) => {
  // Check if file was uploaded
  if (!image) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No file was uploaded');
  }
  // Check if file is an image
  if (!image.mimetype.startsWith('image')) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'File must be an image');
  }
  // Check if file is less than 10MB
  if (image.size > process.env.MAX_FILE_UPLOAD_SIZE) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'File must be less than 10MB');
  }
  // Create unique filename
  const newName = `cert_image_${givenFor}_${givenTo}_${path.extname(image.name)}`;

  // Save file to disk
  image.mv(path.join(process.env.UPLOAD_PATH, newName), async (err) => {
    if (err) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error saving file');
    }
  });
  return newName;
};

/**
 * Create a certificate
 * @param {Object} req
 * @returns {Promise<EnforceDocument<T, TMethods>[]>}
 * @throws {ApiError}
 */
const createCertificate = async (req) => {
  const { files, body } = req;
  req.body.image = isImageValid(files.image, body.givenFor, body.givenTo);
  return Certificate.create(req.body);
};

/**
 * Get all certificates of a user
 * @param {ObjectId} userId
 * @throws {ApiError}
 * @returns {Promise<Certificate[]>}
 */
const getCertificatesByUserId = async (userId) => {
  return Certificate.find({ givenTo: userId });
};

/**
 * Get a certificate by id
 * @param {ObjectId} id
 * @throws {ApiError}
 * @returns {Promise<Certificate>}
 */
const getCertificateById = async (id) => {
  const certificate = await Certificate.findById(id);
  if (!certificate) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Certificate not found');
  }
  return certificate;
};

/**
 * Get all certificates issued by an admin
 * @param {ObjectId} adminId
 * @throws {ApiError}
 * @returns {Promise<Certificate[]>}
 */
const getCertificatesByAdminId = async (adminId) => {
  return Certificate.find({ givenBy: adminId });
};

/**
 * Delete a certificate by id
 * @param {ObjectId} id
 * @throws {ApiError}
 * @returns {Promise<Certificate>}
 */
const deleteCertificateById = async (id) => {
  const certificate = await Certificate.findById(id);
  if (!certificate) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Certificate not found');
  }

  // Delete image from disk
  const filePath = path.join(process.env.UPLOAD_PATH, certificate.image);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  await certificate.remove();
  return certificate;
};

module.exports = {
  createCertificate,
  deleteCertificateById,
  getCertificatesByUserId,
  getCertificatesByAdminId,
  getCertificateById,
};
