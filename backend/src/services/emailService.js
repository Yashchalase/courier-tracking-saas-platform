const { sendEmail, isEmailConfigured: isEmailConfiguredUtil } = require("../utils/email");
const { SHIPMENT_NOTIFY_STATUSES } = require("../constants/shipmentNotifications");

const NOTIFY_STATUSES = SHIPMENT_NOTIFY_STATUSES;

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function statusLabel(status) {
  return String(status).replace(/_/g, " ");
}

function buildShipmentStatusHtml({
  trackingId,
  newStatus,
  previousStatus,
  tenantName,
  recipientName,
}) {
  const title = statusLabel(newStatus);
  const safeTracking = escapeHtml(trackingId);
  const safeTenant = tenantName ? escapeHtml(tenantName) : null;
  const safeRecipient = recipientName ? escapeHtml(recipientName) : null;

  const messages = {
    CREATED:
      "Your shipment has been registered and is being prepared for pickup.",
    PICKED_UP: "Your package has been picked up and is on its way.",
    AT_SORTING_FACILITY:
      "Your package has arrived at a sorting facility and is being processed.",
    IN_TRANSIT: "Your package is in transit toward its destination.",
    OUT_FOR_DELIVERY:
      "Your package is out for delivery and should arrive soon.",
    DELIVERED: "Your package has been delivered successfully.",
    FAILED:
      "There was an issue with your shipment. Please contact support if you need help.",
    RETURNED:
      "Your shipment has been returned. Contact the carrier if you have questions.",
  };

  const blurb = messages[newStatus] || "Your shipment status has been updated.";

  const transition =
    previousStatus && previousStatus !== newStatus
      ? `<p style="margin:12px 0 0;font-size:14px;color:#64748b;">Previous status: <strong>${escapeHtml(
          statusLabel(previousStatus)
        )}</strong></p>`
      : "";

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#0f766e,#0d9488);padding:20px 24px;">
              <p style="margin:0;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:rgba(255,255,255,0.85);">Shipment update</p>
              <h1 style="margin:8px 0 0;font-size:20px;font-weight:600;color:#ffffff;">${escapeHtml(
                title
              )}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;">
              <p style="margin:0 0 16px;font-size:15px;line-height:1.55;color:#334155;">${blurb}</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
                <tr>
                  <td style="padding:16px 18px;">
                    <p style="margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#64748b;">Tracking ID</p>
                    <p style="margin:0;font-size:18px;font-weight:600;color:#0f172a;letter-spacing:0.02em;">${safeTracking}</p>
                    ${
                      safeRecipient
                        ? `<p style="margin:12px 0 0;font-size:13px;color:#475569;">Recipient: <strong>${safeRecipient}</strong></p>`
                        : ""
                    }
                    ${
                      safeTenant
                        ? `<p style="margin:8px 0 0;font-size:13px;color:#475569;">Carrier: <strong>${safeTenant}</strong></p>`
                        : ""
                    }
                  </td>
                </tr>
              </table>
              ${transition}
            </td>
          </tr>
          <tr>
            <td style="padding:0 24px 24px;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:#94a3b8;">This is an automated message. Please do not reply to this email.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function isEmailConfigured() {
  return isEmailConfiguredUtil();
}

/**
 * Notify sender (company user) about shipment status for all lifecycle states.
 * Soft-noop when SMTP is not configured or recipient missing.
 */
async function notifyShipmentStatusChange({
  toEmail,
  trackingId,
  previousStatus,
  newStatus,
  tenantName,
  recipientName,
}) {
  if (!toEmail || !NOTIFY_STATUSES.has(newStatus)) {
    return;
  }

  const subject = `Shipment ${trackingId} — ${statusLabel(newStatus)}`;
  const html = buildShipmentStatusHtml({
    trackingId,
    newStatus,
    previousStatus,
    tenantName,
    recipientName,
  });

  await sendEmail(toEmail, subject, html);
}

module.exports = {
  isEmailConfigured,
  notifyShipmentStatusChange,
  NOTIFY_STATUSES,
};
