const prisma = require("../config/db");
const { HttpError } = require("../middleware/errorHandler");

const EARTH_KM = 6371;

function haversineKm(lat1, lng1, lat2, lng2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_KM * c;
}

/**
 * Greedy nearest-neighbor tour starting from the first hub in hubIds order.
 */
async function optimizeHubOrder(tenantId, hubIds) {
  if (!Array.isArray(hubIds) || hubIds.length < 2) {
    throw new HttpError(400, "Provide at least two hub IDs");
  }
  const unique = [...new Set(hubIds.map((id) => String(id).trim()).filter(Boolean))];
  if (unique.length < 2) {
    throw new HttpError(400, "Provide at least two distinct hub IDs");
  }

  const hubs = await prisma.hub.findMany({
    where: { tenantId, id: { in: unique } },
  });
  if (hubs.length !== unique.length) {
    throw new HttpError(400, "One or more hubs are invalid for this tenant");
  }

  const byId = new Map(hubs.map((h) => [h.id, h]));
  const remaining = unique.slice(1).map((id) => byId.get(id));
  const ordered = [byId.get(unique[0])];
  let current = ordered[0];

  while (remaining.length) {
    let bestIdx = 0;
    let bestD = haversineKm(
      current.lat,
      current.lng,
      remaining[0].lat,
      remaining[0].lng
    );
    for (let i = 1; i < remaining.length; i++) {
      const d = haversineKm(
        current.lat,
        current.lng,
        remaining[i].lat,
        remaining[i].lng
      );
      if (d < bestD) {
        bestD = d;
        bestIdx = i;
      }
    }
    const next = remaining.splice(bestIdx, 1)[0];
    ordered.push(next);
    current = next;
  }

  const legs = [];
  let totalKm = 0;
  for (let i = 0; i < ordered.length - 1; i++) {
    const a = ordered[i];
    const b = ordered[i + 1];
    const km = haversineKm(a.lat, a.lng, b.lat, b.lng);
    totalKm += km;
    legs.push({
      fromHubId: a.id,
      toHubId: b.id,
      distanceKm: Math.round(km * 100) / 100,
    });
  }

  return {
    orderedHubIds: ordered.map((h) => h.id),
    hubs: ordered.map((h) => ({
      id: h.id,
      name: h.name,
      city: h.city,
      lat: h.lat,
      lng: h.lng,
    })),
    totalDistanceKm: Math.round(totalKm * 100) / 100,
    legs,
  };
}

async function routeLegKm(tenantId, fromHubId, toHubId) {
  const a = String(fromHubId || "").trim();
  const b = String(toHubId || "").trim();
  if (!a || !b) {
    throw new HttpError(400, "fromHubId and toHubId are required");
  }
  if (a === b) {
    return { distanceKm: 0, durationMinutesAt40Kmh: 0 };
  }
  const [from, to] = await Promise.all([
    prisma.hub.findFirst({ where: { id: a, tenantId } }),
    prisma.hub.findFirst({ where: { id: b, tenantId } }),
  ]);
  if (!from || !to) {
    throw new HttpError(404, "Hub not found");
  }
  const km = haversineKm(from.lat, from.lng, to.lat, to.lng);
  const durationMinutesAt40Kmh = Math.round((km / 40) * 60);
  return {
    fromHub: { id: from.id, name: from.name, city: from.city },
    toHub: { id: to.id, name: to.name, city: to.city },
    distanceKm: Math.round(km * 100) / 100,
    durationMinutesAt40Kmh,
  };
}

module.exports = {
  haversineKm,
  optimizeHubOrder,
  routeLegKm,
};
