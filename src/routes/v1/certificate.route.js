const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const certificateValidation = require('../../validations/certificate.validation');
const certificateController = require('../../controllers/certificate.controller');

const router = express.Router();

router
  .route('/')
  .post(
    auth('manageCertificates'),
    validate(certificateValidation.createCertificate),
    certificateController.createCertificate
  );

router
  .route('/:certificateId')
  .get(validate(certificateValidation.getCertificateById), certificateController.getCertificateById)
  .delete(
    auth('manageCertificates'),
    validate(certificateValidation.deleteCertificate),
    certificateController.deleteCertificateById
  );

router
  .route('/user/:userId')
  .get(validate(certificateValidation.getCertificatesByUserId), certificateController.getCertificatesByUserId);

router
  .route('/admin/:adminId')
  .get(validate(certificateValidation.getCertificatesByAdminId), certificateController.getCertificatesByAdminId);

module.exports = router;
