import nodemailer from 'nodemailer';
import config from '../config';

const sendEmail = async (to: string, subject: string, html: string): Promise<void> => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.email.support_email,
      pass: config.email.app_password,
    },
  });

  await transporter.sendMail({
    from: `"Support System" <${config.email.support_email}>`,
    to,
    subject,
    html,
  });
};

export const sendEmailHelper = {
  sendEmail,
};
