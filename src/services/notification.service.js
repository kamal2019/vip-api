const { Notification } = require('../models');

/**
 * Returns all notification
 * @param  null
 * @returns {Promise<Notification>}
 * @throws {ApiError}
 */
const getNotifications = async () => {
  const notifications = await Notification.find({});
  return notifications;
};

module.exports = {
  getNotifications,
};
