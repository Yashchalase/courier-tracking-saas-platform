const { ShipmentStatus } = require("@prisma/client");
const prisma = require("../config/db");

const PENDING_STATUSES = [
  ShipmentStatus.CREATED,
  ShipmentStatus.PICKED_UP,
  ShipmentStatus.AT_SORTING_FACILITY,
  ShipmentStatus.IN_TRANSIT,
  ShipmentStatus.OUT_FOR_DELIVERY,
];

async function getTenantSummary(tenantId) {
  const base = { tenantId };

  const [
    totalShipments,
    delivered,
    failed,
    inTransit,
    pending,
  ] = await Promise.all([
    prisma.shipment.count({ where: base }),
    prisma.shipment.count({
      where: { ...base, status: ShipmentStatus.DELIVERED },
    }),
    prisma.shipment.count({
      where: { ...base, status: ShipmentStatus.FAILED },
    }),
    prisma.shipment.count({
      where: { ...base, status: ShipmentStatus.IN_TRANSIT },
    }),
    prisma.shipment.count({
      where: { ...base, status: { in: PENDING_STATUSES } },
    }),
  ]);

  return {
    totalShipments,
    delivered,
    failed,
    inTransit,
    pending,
  };
}

module.exports = {
  getTenantSummary,
};
