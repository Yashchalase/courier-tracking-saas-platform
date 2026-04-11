/**
 * Shipment statuses that trigger email and optional SMS notifications.
 * Keep in sync with Prisma enum ShipmentStatus.
 */
const SHIPMENT_NOTIFY_STATUSES = new Set([
  "CREATED",
  "PICKED_UP",
  "AT_SORTING_FACILITY",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "FAILED",
  "RETURNED",
]);

module.exports = { SHIPMENT_NOTIFY_STATUSES };
