const httpStatus = require('http-status');
const path = require('path');
const fs = require('fs');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  if (await User.isPhoneTaken(userBody.phone)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Phone already taken');
  }

  return User.create(userBody);
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
  return User.paginate(filter, options);
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return User.findById(id);
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  if (updateBody.phone && (await User.isPhoneTaken(updateBody.phone, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Phone already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Upload user profile pic
 * @param {ObjectId} userId
 * @param {Object} file
 * @returns {Promise<User>}
 */
const updateProfilePic = async (userId, file) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Check if file was uploaded
  if (!file) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No file uploaded');
  }
  // Check if file is an image
  if (!file.profilePic.mimetype.startsWith('image')) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'File must be an image');
  }
  // Check if file size
  if (file.profilePic.size > process.env.MAX_FILE_UPLOAD_SIZE) {
    throw new ApiError(httpStatus.BAD_REQUEST, `File must be less than ${process.env.MAX_FILE_UPLOAD_SIZE / 1000000}MB`);
  }
  // Create unique filename
  const newName = `profile_image_${user._id}${path.extname(file.profilePic.name)}`;

  // Save file to disk
  await file.profilePic.mv(path.join(process.env.UPLOAD_PATH, newName), async (err) => {
    if (err) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error saving file');
    }
    // Update user
    user.profilePic = newName;
    await user.save();
  });
  return user;
};

/**
 * Special function to update every part of the user object
 * @param {Object} userId
 * @param req
 * @returns {Promise<User>}
 * @throws {ApiError}
 */
const updateUserSpecial = async (userId, req) => {
  const { files, body } = req;
  if (files) {
    await updateProfilePic(userId, files);
  }

  return updateUserById(userId, body);
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Delete users profile pic
  if (user.profilePic) {
    const filePath = path.join(process.env.UPLOAD_PATH, user.profilePic);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
  await user.remove();
  return user;
};

module.exports = {
  createUser,
  queryUsers,
  getUserById,
  updateProfilePic,
  updateUserSpecial,
  getUserByEmail,
  updateUserById,
  deleteUserById,
};
