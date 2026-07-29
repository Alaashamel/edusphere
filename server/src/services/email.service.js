import nodemailer from "nodemailer";
import { config } from "../config/index.js";
import logger from "../utils/logger.js";

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });
  }

  async sendVerificationEmail({ to, firstName, token }) {
    const verificationUrl = `${config.frontendUrl}/verify-email/${token}`;

    const html = `
      <div style="max-width:600px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
        <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px;text-align:center;border-radius:12px 12px 0 0">
          <h1 style="color:#fff;margin:0;font-size:24px">EduSphere</h1>
        </div>
        <div style="padding:32px;background:#fff;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 12px 12px">
          <h2 style="color:#111;margin:0 0 16px">Verify Your Email</h2>
          <p style="color:#374151;line-height:1.6;margin:0 0 24px">Hi ${firstName}, thanks for joining EduSphere! Please verify your email address by clicking the button below.</p>
          <a href="${verificationUrl}" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600">Verify Email</a>
          <p style="color:#6b7280;font-size:14px;margin:24px 0 0;line-height:1.5">Or copy this link: <br/><a href="${verificationUrl}" style="color:#6366f1">${verificationUrl}</a></p>
          <p style="color:#6b7280;font-size:14px;margin:16px 0 0">This link expires in 24 hours.</p>
        </div>
      </div>
    `;

    await this._send({
      to,
      subject: "Verify your EduSphere email address",
      html,
    });
  }

  async sendPasswordResetEmail({ to, firstName, token }) {
    const resetUrl = `${config.frontendUrl}/reset-password/${token}`;

    const html = `
      <div style="max-width:600px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
        <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px;text-align:center;border-radius:12px 12px 0 0">
          <h1 style="color:#fff;margin:0;font-size:24px">EduSphere</h1>
        </div>
        <div style="padding:32px;background:#fff;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 12px 12px">
          <h2 style="color:#111;margin:0 0 16px">Reset Your Password</h2>
          <p style="color:#374151;line-height:1.6;margin:0 0 24px">Hi ${firstName}, you requested a password reset. Click the button below to set a new password.</p>
          <a href="${resetUrl}" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600">Reset Password</a>
          <p style="color:#6b7280;font-size:14px;margin:24px 0 0;line-height:1.5">Or copy this link: <br/><a href="${resetUrl}" style="color:#6366f1">${resetUrl}</a></p>
          <p style="color:#6b7280;font-size:14px;margin:16px 0 0">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
        </div>
      </div>
    `;

    await this._send({
      to,
      subject: "Reset your EduSphere password",
      html,
    });
  }

  async _send({ to, subject, html }) {
    if (!config.smtp.user || !config.smtp.pass) {
      logger.warn(`SMTP not configured. Skipping email to ${to}: ${subject}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: `"${config.email.fromName}" <${config.email.from}>`,
        to,
        subject,
        html,
      });
      logger.info(`Email sent: ${subject} -> ${to}`);
    } catch (error) {
      logger.error(`Failed to send email to ${to}: ${error.message}`);
    }
  }
}

export default new EmailService();
