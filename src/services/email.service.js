const nodemailer = require('nodemailer');
const config = require('../config/config');
const logger = require('../config/logger');

const transport = nodemailer.createTransport(config.email.smtp);
/* istanbul ignore next */
if (config.env !== 'test') {
  transport
    .verify()
    .then(() => logger.info('Connected to email server'))
    .catch(() => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env'));
}

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @param html
 * @returns {Promise}
 */
const sendEmail = async (to, subject, text, html) => {
  const msg = { from: config.email.from, to, subject, text, html };
  await transport.sendMail(msg);
};

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @param username
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (to, token, username) => {
  const subject = 'VIP App Password Reset';
  // replace this url with the link to the reset password page of your front-end app
  const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password/token=${token}`;
  const text = `
               Dear ${username.name},
                  To reset your password, click on this ${resetPasswordUrl} link.

                  This link will expire in 10 minutes.

                  If you did not request any password resets, then ignore this email.

                  Thank you,
                  VIP App Team
                  `;

  const html = `
                <h3>Dear ${username.name},</h3>

                <p style="
                          font-size: 1rem;
                          line-height: 24px;
                          margin: 0 0 24px;
                          color: #000;">
                  To reset your password, click on this <a href="${resetPasswordUrl}">link</a>
                </p>

                <p style="
                              font-size: 1rem;
                              line-height: 18px;
                              margin: 0 0 24px;
                              color: #a00;">

                This link will expire in 10 minutes.
                </p>

                <p style="
                          font-size: 1rem;
                          line-height: 18px;
                          margin: 0 0 24px;
                          color: #000;"
                >
                  If you did not request any password resets, then ignore this email.
                </p>

                <p style="
                        font-size: 1rem;
                        line-height: 24px;
                        margin: 0 0 16px;
                        color: #333;"
                >

                  Thank you,
                  <br>
                  VIP App Team
                </p>
                `;

  await sendEmail(to, subject, text, html);
};

/**
 * Send verification email
 * @param {string} to
 * @param {string} token
 * @param username
 * @returns {Promise}
 */
const sendVerificationEmail = async (to, token, username) => {
  const subject = 'VIP Account Email Verification';
  // replace this url with the link to the email verification page of your front-end app
  const verificationEmailUrl = `${process.env.FRONTEND_URL}/verify-email/token=${token}`;
  const text = `
                Dear ${username.name},

                  To verify your email, click on this link: ${verificationEmailUrl}, this link will expire in 10 minutes.

                  If you did not create an account, then ignore this email.

                  Thank you,
                  VIP App Team
                  `;

  const html = `
                <h2>Dear ${username.name},</h2>

                  To verify your email, click on this <a href="${verificationEmailUrl}">link</a>
                  This link will expire in 10 minutes.

                  If you did not create an account, then ignore this email.

                  Thank you,
                  VIP App Team

  `;
  await sendEmail(to, subject, text, html);
};

module.exports = {
  transport,
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
};
