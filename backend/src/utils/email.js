const nodemailer = require("nodemailer");
const dns = require("node:dns");

let transporter;

function lookupIpv4(hostname, options, callback) {
  // Force IPv4 resolution to avoid IPv6 ENETUNREACH in some container networks.
  return dns.lookup(hostname, { family: 4 }, callback);
}

/**
 * Builds a Nodemailer transport from environment.
 * Priority: SMTP_URL → explicit SMTP (SMTP_HOST) → Resend (RESEND_API_KEY).
 */
function getTransporter() {
  if (transporter) {
    return transporter;
  }

  if (process.env.SMTP_URL) {
    transporter = nodemailer.createTransport(process.env.SMTP_URL);
    return transporter;
  }

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    const port = process.env.SMTP_PORT
      ? parseInt(process.env.SMTP_PORT, 10)
      : 587;
    const secure =
      process.env.SMTP_SECURE === "true" || port === 465;
    transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      lookup: lookupIpv4,
    });
    return transporter;
  }

  if (process.env.RESEND_API_KEY) {
    transporter = nodemailer.createTransport({
      host: "smtp.resend.com",
      port: 465,
      secure: true,
      auth: {
        user: "resend",
        pass: process.env.RESEND_API_KEY,
      },
      lookup: lookupIpv4,
    });
    return transporter;
  }

  return null;
}

function getFromAddress() {
  return process.env.MAIL_FROM || process.env.EMAIL_FROM || null;
}

function isEmailConfigured() {
  return getTransporter() != null && !!getFromAddress();
}

/**
 * Send HTML email. Does not throw when mail is not configured; logs and returns.
 * @param {string} to
 * @param {string} subject
 * @param {string} html
 * @returns {Promise<import('nodemailer').SentMessageInfo | void>}
 */
async function sendEmail(to, subject, html) {
  const t = getTransporter();
  const from = getFromAddress();
  if (!t || !from || !to) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[email] Skipping send (not configured or missing recipient)", {
        subject,
      });
    }
    return undefined;
  }

  return t.sendMail({
    from,
    to,
    subject,
    html,
  });
}

/**
 * Legacy helper — same transport as sendEmail; throws if SMTP is not configured.
 * @param {{ to: string; subject: string; text?: string; html?: string }} opts
 */
async function sendMail({ to, subject, text, html }) {
  const t = getTransporter();
  const from = getFromAddress();
  if (!t) {
    throw new Error(
      "Email is not configured. Set SMTP_URL, SMTP_HOST+SMTP_USER+SMTP_PASS, or RESEND_API_KEY."
    );
  }
  if (!from) {
    throw new Error("Set MAIL_FROM or EMAIL_FROM in the environment.");
  }
  const body =
    html ||
    (text
      ? `<pre style="font-family:system-ui,sans-serif;font-size:14px;">${String(
          text
        )
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")}</pre>`
      : "");
  if (!body) {
    throw new Error("sendMail requires text or html");
  }
  return t.sendMail({
    from,
    to,
    subject,
    html: body,
    ...(text && !html ? { text } : {}),
  });
}

module.exports = {
  getTransporter,
  getFromAddress,
  isEmailConfigured,
  sendEmail,
  sendMail,
};
