const nodemailer = require('nodemailer');

/**
 * Create nodemailer transporter using SMTP credentials from .env
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/** Send generic email */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: `"Celova" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text: text || '',
    });
    console.log(`✉️  Email sent to ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('Email send error:', error.message);
    return false;
  }
};

/** Send OTP for password reset */
const sendPasswordResetOTP = async (email, otp, name) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'DM Sans', sans-serif; background: #0a0a0a; color: #f5f5f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #111111; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.07); }
        .header { background: linear-gradient(135deg, #f97316, #fb923c); padding: 40px; text-align: center; }
        .header h1 { margin: 0; color: #fff; font-size: 28px; font-weight: 800; }
        .body { padding: 40px; }
        .otp-box { background: #181818; border-radius: 12px; padding: 30px; text-align: center; margin: 24px 0; border: 2px solid #f97316; }
        .otp { font-size: 48px; font-weight: 800; color: #f97316; letter-spacing: 12px; font-family: 'Space Mono', monospace; }
        .footer { padding: 24px 40px; border-top: 1px solid rgba(255,255,255,0.07); text-align: center; color: #525252; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎬 Celova</h1>
        </div>
        <div class="body">
          <h2>Hi ${name},</h2>
          <p>You requested to reset your password. Use the OTP below. It expires in <strong>10 minutes</strong>.</p>
          <div class="otp-box">
            <div class="otp">${otp}</div>
          </div>
          <p>If you didn't request this, please ignore this email. Your account is safe.</p>
        </div>
        <div class="footer">
          <p>© 2026 Celova. Where AI Brings Stories to Life.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Celova — Password Reset OTP',
    html,
    text: `Your Celova password reset OTP is: ${otp}. It expires in 10 minutes.`,
  });
};

/** Welcome email for new registrations */
const sendWelcomeEmail = async (email, name, role) => {
  const roleMessage = role === 'creator'
    ? 'You signed up as a creator! Start uploading your AI-animated masterpieces.'
    : 'You signed up as a viewer. Explore thousands of AI-animated series!';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: sans-serif; background: #0a0a0a; color: #f5f5f5; }
        .container { max-width: 600px; margin: 40px auto; background: #111111; border-radius: 16px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #f97316, #fb923c); padding: 40px; text-align: center; }
        .header h1 { margin: 0; color: #fff; font-size: 28px; font-weight: 800; }
        .body { padding: 40px; }
        .cta { display: inline-block; background: #f97316; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; margin-top: 20px; }
        .footer { padding: 24px 40px; border-top: 1px solid rgba(255,255,255,0.07); text-align: center; color: #525252; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header"><h1>🎬 Welcome to Celova!</h1></div>
        <div class="body">
          <h2>Hey ${name}! 👋</h2>
          <p>${roleMessage}</p>
          <p>Celova is the world's first streaming platform built for AI creators — where imagination meets technology.</p>
          <a href="${process.env.CLIENT_URL}" class="cta">Start Watching Now</a>
        </div>
        <div class="footer"><p>© 2026 Celova. Where AI Brings Stories to Life.</p></div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject: 'Welcome to Celova! 🎬', html });
};

/** New episode notification email */
const sendNewEpisodeEmail = async (email, name, seriesTitle, episodeTitle, watchUrl) => {
  const html = `
    <div style="font-family:sans-serif;background:#0a0a0a;color:#f5f5f5;padding:40px;">
      <h2>🎬 New Episode on Celova!</h2>
      <p>Hi ${name},</p>
      <p><strong>${seriesTitle}</strong> just released a new episode: <strong>"${episodeTitle}"</strong></p>
      <a href="${watchUrl}" style="background:#f97316;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block;margin-top:16px;">Watch Now</a>
    </div>
  `;

  return sendEmail({ to: email, subject: `New Episode: ${episodeTitle} — ${seriesTitle}`, html });
};

module.exports = { sendEmail, sendPasswordResetOTP, sendWelcomeEmail, sendNewEpisodeEmail };
