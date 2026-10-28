import nodemailer from 'nodemailer';

import { EMAIL_USER, EMAIL_PASSWORD } from '../config/env.js';
import { generateEmailTemplate } from './email-template.js';

// Configure transporter to use Ethereal's SMTP server for safe local testing
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
});

export const sendReminderEmail = async ({ to, type, subscription }) => {
  if (!to || !type) throw new Error('Missing required parameters');

  // type looks like "7 days before reminder", so the first number is the days left
  const daysLeft = parseInt(type, 10);

  const { subject, html } = generateEmailTemplate({
    userName: subscription.user.name,
    subscription,
    daysLeft,
  });

  const mailOptions = {
    from: EMAIL_USER,
    to,
    subject,
    html,
  };

  const info = await transporter.sendMail(mailOptions);

  console.log(`✅ Reminder email sent to ${to}: ${subject}`);
  
  // Generates a clickable link in your server terminal to view the rendered email template in your browser
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`🔗 Preview Email in Browser: ${previewUrl}`);
  }
};