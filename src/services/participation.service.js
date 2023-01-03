/* eslint-disable security/detect-non-literal-fs-filename */
const path = require('path');
const fs = require('fs');

const httpStatus = require('http-status');
const { Participation } = require('../models');
const ApiError = require('../utils/ApiError');

const isImageValid = (image, postId, userId) => {
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
  const newName = `part_image_${postId}_${userId}${path.extname(image.name)}`;

  // Save file to disk
  image.mv(path.join(process.env.UPLOAD_PATH, newName), async (err) => {
    if (err) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error saving file');
    }
  });
  return newName;
};

/**
 * Create a participation
 *  @param {Object} req
 * @returns {Promise<Participation>}
 * @throws {ApiError}
 * */
const createParticipation = async (req) => {
  const { files, body } = req;
  const newName = await isImageValid(files.image, body.postId, body.userId);
  req.body.image = newName;
  const participation = await Participation.create(req.body);
  return participation;
};

/**
 * Update a participation
 * @param {Object} req
 * @returns {Promise<Participation>}
 * @throws {ApiError}
 */
const updateParticipation = async (req) => {
  const { status } = req.body;
  const participation = await Participation.findById(req.params.participationId);
  if (!participation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Participation not found');
  }
  participation.status = status;
  await participation.save();
  return participation;
};

/**
 * Get all participations
 * @returns {Promise<Participation[]>}
 */
const getAllParticipants = async () => {
  const participations = await Participation.find();
  return participations;
};

/**
 * Get a participation by postId
 *  @param {Object} postId
 * @returns {Promise<Participation>}
 * */

const getParticipationsByPostId = async (postId) => {
  // Get participations by postId
  const participations = await Participation.find({ postId });
  return participations;
};

/**
 * Get a participation by userId
 *  @param {Object} userId
 * @returns {Promise<Participation>}
 * */

const getParticipationByUserId = async (userId) => {
  const participations = await Participation.find({ userId });
  return participations;
};

/**
 *
 * @param {Object} id
 * @returns {Promise<Participation>}
 * @throws {ApiError}
 */

const getParticipationById = async (id) => {
  const participation = await Participation.findById(id);
  if (!participation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Participation not found');
  }
  return participation;
};

/**
 * Delete a participation by id
 * @param {Object} id
 * @throws {ApiError}
 * @returns {Promise<Participation>}
 */
const deleteParticipationById = async (id) => {
  const participation = await Participation.findById(id);
  if (!participation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Participation not found');
  }
  // Delete image from disk
  const filePath = path.join(process.env.UPLOAD_PATH, participation.image);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  await participation.remove();
  return participation;
};

module.exports = {
  createParticipation,
  updateParticipation,
  getAllParticipants,
  getParticipationsByPostId,
  getParticipationByUserId,
  getParticipationById,
  deleteParticipationById,
};
