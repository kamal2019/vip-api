const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const participationValidation = require('../../validations/participation.validation');
const participationController = require('../../controllers/participation.controller');

const router = express.Router();

router
  .route('/')
  .get(auth('manageParticipations'), participationController.getAllParticipants)
  .post(
    auth('createParticipation'),
    validate(participationValidation.createParticipation),
    participationController.createParticipation
  );

router
  .route('/:participationId')
  .get(validate(participationValidation.getParticipationById), participationController.getParticipationById)
  .patch(
    auth('manageParticipations'),
    validate(participationValidation.updateParticipation),
    participationController.updateParticipation
  )
  .delete(
    auth('createParticipation'),
    validate(participationValidation.deleteParticipationById),
    participationController.deleteParticipationById
  );

router
  .route('/post/:postId')
  .get(validate(participationValidation.getParticipationsByPostId), participationController.getParticipationsByPostId);

router
  .route('/user/:userId')
  .get(validate(participationValidation.getParticipationByUserId), participationController.getParticipationByUserId);

module.exports = router;
