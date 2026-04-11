const { notifyShipmentStatusChange } = require("./emailService");
const { notifyRecipientShipmentStatus } = require("./smsService");

/**
 * Email to recipient (recipientEmail) when set, otherwise sender (company user).
 * Optional SMS to recipientPhone when Twilio is configured.
 * Failures are logged; never throws to callers.
 */
async function notifyShipmentParties({
  recipientEmail,
  senderEmail,
  recipientPhone,
  trackingId,
  previousStatus,
  newStatus,
  tenantName,
  recipientName,
}) {
  const emailTo =
    (recipientEmail && String(recipientEmail).trim()) || senderEmail || null;

  try {
    if (emailTo) {
      await notifyShipmentStatusChange({
        toEmail: emailTo,
        trackingId,
        previousStatus,
        newStatus,
        tenantName,
        recipientName,
      });
    }
  } catch (e) {
    console.error("[notify] email failed:", e.message);
  }

  try {
    await notifyRecipientShipmentStatus({
      toPhone: recipientPhone,
      trackingId,
      newStatus,
      tenantName,
    });
  } catch (e) {
    console.error("[notify] sms failed:", e.message);
  }
}

module.exports = {
  notifyShipmentParties,
};
