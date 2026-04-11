const { SHIPMENT_NOTIFY_STATUSES } = require("../constants/shipmentNotifications");

let twilioClient = null;
let twilioFromNumber = null;
let twilioInitAttempted = false;

function initTwilio() {
  if (twilioInitAttempted) {
    return;
  }
  twilioInitAttempted = true;
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;
  if (!sid || !token || !from) {
    return;
  }
  try {
    // eslint-disable-next-line global-require
    const twilio = require("twilio");
    twilioClient = twilio(sid, token);
    twilioFromNumber = from;
  } catch {
    twilioClient = null;
    twilioFromNumber = null;
  }
}

function isSmsConfigured() {
  initTwilio();
  return Boolean(twilioClient && twilioFromNumber);
}

function normalizeE164(raw) {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s) return null;
  const digits = s.replace(/[^\d+]/g, "");
  if (digits.startsWith("+") && digits.length >= 10) {
    return digits;
  }
  if (/^\d{10,15}$/.test(digits)) {
    return `+${digits}`;
  }
  return null;
}

function statusLabel(status) {
  return String(status).replace(/_/g, " ");
}

const SMS_LINES = {
  CREATED: "registered and is being prepared for pickup.",
  PICKED_UP: "picked up and is on the way.",
  AT_SORTING_FACILITY: "at a sorting facility.",
  IN_TRANSIT: "in transit.",
  OUT_FOR_DELIVERY: "out for delivery.",
  DELIVERED: "delivered.",
  FAILED: "could not be completed. Contact the carrier if you need help.",
  RETURNED: "has been returned.",
};

/**
 * Optional SMS to recipient phone (E.164 preferred). No-op if Twilio env missing or number invalid.
 */
async function notifyRecipientShipmentStatus({
  toPhone,
  trackingId,
  newStatus,
  tenantName,
}) {
  initTwilio();
  if (!twilioClient || !twilioFromNumber) {
    return;
  }
  if (!SHIPMENT_NOTIFY_STATUSES.has(newStatus)) {
    return;
  }
  const e164 = normalizeE164(toPhone);
  if (!e164) {
    return;
  }

  const tail = SMS_LINES[newStatus] || "status was updated.";
  const carrier = tenantName ? ` (${tenantName})` : "";
  const body = `Courier update${carrier}: ${trackingId} — ${statusLabel(
    newStatus
  )}. Your package is ${tail}`;

  await twilioClient.messages.create({
    body: body.slice(0, 1600),
    from: twilioFromNumber,
    to: e164,
  });
}

module.exports = {
  isSmsConfigured,
  notifyRecipientShipmentStatus,
  normalizeE164,
};
