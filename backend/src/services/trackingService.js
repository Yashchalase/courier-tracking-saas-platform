const prisma = require("../config/db");
const { HttpError } = require("../middleware/errorHandler");

async function getPublicByTrackingId(trackingId) {
  const shipment = await prisma.shipment.findUnique({
    where: { trackingId },
    include: {
      events: { orderBy: { createdAt: "asc" } },
      originHub: true,
      destinationHub: true,
    },
  });
  if (!shipment) {
    throw new HttpError(404, "Tracking number not found");
  }
  return shipment;
}

/**
 * Public tracking payload — no tenant, user, or internal shipment id.
 */
async function getPublicTrackByTrackingId(trackingId) {
  const shipment = await prisma.shipment.findUnique({
    where: { trackingId },
    select: {
      trackingId: true,
      status: true,
      estimatedDelivery: true,
      events: {
        orderBy: { createdAt: "asc" },
        select: {
          status: true,
          note: true,
          createdAt: true,
          lat: true,
          lng: true,
          proofImageUrl: true,
        },
      },
    },
  });
  if (!shipment) {
    throw new HttpError(404, "Tracking number not found");
  }
  return shipment;
}

module.exports = {
  getPublicByTrackingId,
  getPublicTrackByTrackingId,
};
