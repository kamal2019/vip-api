const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { participationService } = require('../services');

const createParticipation = catchAsync(async (req, res) => {
  const participation = await participationService.createParticipation(req);
  res.status(httpStatus.CREATED).send(participation);
});

const updateParticipation = catchAsync(async (req, res) => {
  const participation = await participationService.updateParticipation(req);
  res.status(httpStatus.OK).send(participation);
});

const getAllParticipants = catchAsync(async (req, res) => {
  const participations = await participationService.getAllParticipants(req);
  res.status(httpStatus.OK).send(participations);
});

const getParticipationsByPostId = catchAsync(async (req, res) => {
  const participations = await participationService.getParticipationsByPostId(req.params.postId);
  res.status(httpStatus.OK).send(participations);
});

const getParticipationByUserId = catchAsync(async (req, res) => {
  const participations = await participationService.getParticipationByUserId(req.params.userId);
  res.status(httpStatus.OK).send(participations);
});

const getParticipationById = catchAsync(async (req, res) => {
  const participation = await participationService.getParticipationById(req.params.participationId);
  res.status(httpStatus.OK).send(participation);
});

const deleteParticipationById = catchAsync(async (req, res) => {
  await participationService.deleteParticipationById(req.params.participationId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createParticipation,
  updateParticipation,
  getAllParticipants,
  getParticipationsByPostId,
  getParticipationByUserId,
  getParticipationById,
  deleteParticipationById,
};
