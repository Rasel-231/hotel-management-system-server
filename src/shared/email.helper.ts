import nodemailer from 'nodemailer';
import config from '../config';


interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType?: string;
}

const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  attachments?: EmailAttachment[]
): Promise<void> => {
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
    attachments,
  });
};

export const sendEmailHelper = {
  sendEmail,
};