const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { certificateService } = require('../services');

const createCertificate = catchAsync(async (req, res) => {
  const certificate = await certificateService.createCertificate(req);
  res.status(httpStatus.CREATED).send(certificate);
});

const deleteCertificateById = catchAsync(async (req, res) => {
  await certificateService.deleteCertificateById(req.params.certificateId);
  res.status(httpStatus.NO_CONTENT).send();
});

const getCertificatesByUserId = catchAsync(async (req, res) => {
  const certificates = await certificateService.getCertificatesByUserId(req.params.userId);
  res.status(httpStatus.OK).send(certificates);
});

const getCertificatesByAdminId = catchAsync(async (req, res) => {
  const certificates = await certificateService.getCertificatesByAdminId(req.params.adminId);
  res.status(httpStatus.OK).send(certificates);
});

const getCertificateById = catchAsync(async (req, res) => {
  const certificate = await certificateService.getCertificateById(req.params.certificateId);
  res.status(httpStatus.OK).send(certificate);
});

module.exports = {
  createCertificate,
  deleteCertificateById,
  getCertificatesByUserId,
  getCertificatesByAdminId,
  getCertificateById,
};
