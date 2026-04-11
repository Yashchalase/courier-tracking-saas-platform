const { ShipmentStatus } = require("@prisma/client");
const { HttpError } = require("../middleware/errorHandler");

/** Allowed next statuses from each current status (operational workflow). */
const ALLOWED_TRANSITIONS = {
  [ShipmentStatus.CREATED]: [
    ShipmentStatus.PICKED_UP,
    ShipmentStatus.FAILED,
  ],
  [ShipmentStatus.PICKED_UP]: [
    ShipmentStatus.AT_SORTING_FACILITY,
    ShipmentStatus.IN_TRANSIT,
    ShipmentStatus.FAILED,
    ShipmentStatus.RETURNED,
  ],
  [ShipmentStatus.AT_SORTING_FACILITY]: [
    ShipmentStatus.IN_TRANSIT,
    ShipmentStatus.FAILED,
    ShipmentStatus.RETURNED,
  ],
  [ShipmentStatus.IN_TRANSIT]: [
    ShipmentStatus.AT_SORTING_FACILITY,
    ShipmentStatus.OUT_FOR_DELIVERY,
    ShipmentStatus.FAILED,
    ShipmentStatus.RETURNED,
  ],
  [ShipmentStatus.OUT_FOR_DELIVERY]: [
    ShipmentStatus.DELIVERED,
    ShipmentStatus.FAILED,
    ShipmentStatus.RETURNED,
  ],
  [ShipmentStatus.DELIVERED]: [],
  [ShipmentStatus.FAILED]: [
    ShipmentStatus.RETURNED,
    ShipmentStatus.IN_TRANSIT,
    ShipmentStatus.AT_SORTING_FACILITY,
  ],
  [ShipmentStatus.RETURNED]: [],
};

function isValidTransition(fromStatus, toStatus) {
  if (fromStatus === toStatus) {
    return true;
  }
  const allowed = ALLOWED_TRANSITIONS[fromStatus];
  return Array.isArray(allowed) && allowed.includes(toStatus);
}

function assertValidTransition(fromStatus, toStatus) {
  if (fromStatus === toStatus) {
    return;
  }
  if (!isValidTransition(fromStatus, toStatus)) {
    const allowed = ALLOWED_TRANSITIONS[fromStatus] || [];
    const hint =
      allowed.length > 0
        ? ` Allowed from ${fromStatus}: ${allowed.join(", ")}.`
        : " No further transitions allowed.";
    throw new HttpError(
      400,
      `Invalid status transition from ${fromStatus} to ${toStatus}.${hint}`
    );
  }
}

module.exports = {
  ALLOWED_TRANSITIONS,
  isValidTransition,
  assertValidTransition,
};
