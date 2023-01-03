const express = require('express');
const notificationController = require('../../controllers/notification.controller');

const router = express.Router();

router.get('/', notificationController.getNotifications);

module.exports = router;
