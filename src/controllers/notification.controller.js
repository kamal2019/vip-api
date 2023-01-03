const { notificationService } = require('../services');

const getNotifications = async (req, res) => {
  const notifications = await notificationService.getNotifications();
  res.status(200).send(notifications);
};

module.exports = {
  getNotifications,
};
