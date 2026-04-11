const { ShipmentStatus } = require("@prisma/client");
const prisma = require("../config/db");
const { HttpError } = require("../middleware/errorHandler");

const MIN_SAMPLES = 2;
const MAX_HOURS = 24 * 45; // ignore outliers beyond ~45 days "in transit"

/**
 * History-based ETA: median hours from creation to last update for DELIVERED
 * shipments on the same origin → destination hub pair (same tenant).
 */
async function predictedEtaForHubPair(tenantId, originHubId, destinationHubId) {
  const o = String(originHubId || "").trim();
  const d = String(destinationHubId || "").trim();
  if (!o || !d) {
    throw new HttpError(400, "originHubId and destinationHubId are required");
  }
  if (o === d) {
    return {
      sampleSize: 0,
      medianHours: null,
      suggestedEstimatedDelivery: null,
      message: "Pick two different hubs to get a delivery estimate.",
    };
  }

  const [origin, dest] = await Promise.all([
    prisma.hub.findFirst({ where: { id: o, tenantId } }),
    prisma.hub.findFirst({ where: { id: d, tenantId } }),
  ]);
  if (!origin || !dest) {
    throw new HttpError(404, "Hub not found");
  }

  const rows = await prisma.shipment.findMany({
    where: {
      tenantId,
      originHubId: o,
      destinationHubId: d,
      status: ShipmentStatus.DELIVERED,
    },
    select: { createdAt: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
    take: 250,
  });

  const hours = rows
    .map((s) => (s.updatedAt - s.createdAt) / 3_600_000)
    .filter((h) => h > 0.25 && h < MAX_HOURS);

  if (hours.length < MIN_SAMPLES) {
    return {
      sampleSize: hours.length,
      medianHours: null,
      suggestedEstimatedDelivery: null,
      message:
        hours.length === 0
          ? "We don't have finished deliveries on this route yet — add an estimated time yourself."
          : "We need a few more finished deliveries on this route before we can suggest a time.",
    };
  }

  hours.sort((a, b) => a - b);
  const mid = Math.floor(hours.length / 2);
  const medianHours =
    hours.length % 2 === 1
      ? hours[mid]
      : (hours[mid - 1] + hours[mid]) / 2;

  const suggested = new Date(Date.now() + medianHours * 3_600_000);

  return {
    sampleSize: hours.length,
    medianHours: Math.round(medianHours * 10) / 10,
    suggestedEstimatedDelivery: suggested.toISOString(),
    message: `Based on ${hours.length} similar deliveries that already finished on this route.`,
  };
}

module.exports = {
  predictedEtaForHubPair,
};
