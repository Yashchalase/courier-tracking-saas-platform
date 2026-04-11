const { ShipmentStatus, UserRole } = require("@prisma/client");
const prisma = require("../config/db");
const { HttpError } = require("../middleware/errorHandler");
const { assertValidTransition } = require("./shipmentStatus");
const { notifyShipmentParties } = require("./notificationService");
const { recordAudit } = require("./auditService");

const LEGACY_LIST_LIMIT = 100;

function buildTenantWhere(tenantId, role, userId) {
  const base = { tenantId };
  if (role === UserRole.CUSTOMER) {
    return { ...base, senderId: userId };
  }
  return base;
}

async function assertShipmentVisible(tenantId, role, userId, shipment) {
  if (!shipment) {
    throw new HttpError(404, "Shipment not found");
  }
  if (role === UserRole.CUSTOMER && shipment.senderId !== userId) {
    throw new HttpError(404, "Shipment not found");
  }
}

async function listForTenant(tenantId, role, userId, query) {
  const {
    status,
    assignedAgentId,
    senderId,
    originHubId,
    destinationHubId,
    trackingId,
    page: pageRaw,
    limit: limitRaw,
  } = query;

  const usePagination =
    pageRaw !== undefined || limitRaw !== undefined;

  const where = buildTenantWhere(tenantId, role, userId);

  if (status) {
    where.status = status;
  }
  if (assignedAgentId) {
    where.assignedAgentId = assignedAgentId;
  }
  if (senderId && role !== UserRole.CUSTOMER) {
    where.senderId = senderId;
  }
  if (originHubId) {
    where.originHubId = originHubId;
  }
  if (destinationHubId) {
    where.destinationHubId = destinationHubId;
  }
  if (trackingId && typeof trackingId === "string" && trackingId.trim()) {
    where.trackingId = trackingId.trim();
  }

  const orderBy = { createdAt: "desc" };

  if (!usePagination) {
    const shipments = await prisma.shipment.findMany({
      where,
      orderBy,
      take: LEGACY_LIST_LIMIT,
    });
    return { shipments };
  }

  const page = Math.max(1, parseInt(String(pageRaw || "1"), 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(String(limitRaw || "20"), 10) || 20)
  );
  const skip = (page - 1) * limit;

  const [shipments, total] = await prisma.$transaction([
    prisma.shipment.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.shipment.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    shipments,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

async function getByIdForTenant(tenantId, role, userId, id) {
  const shipment = await prisma.shipment.findFirst({
    where: { id, tenantId },
    include: {
      events: { orderBy: { createdAt: "asc" } },
      sender: { select: { id: true, email: true } },
      originHub: true,
      destinationHub: true,
      assignedAgent: {
        include: {
          user: { select: { id: true, email: true, name: true } },
          hub: true,
        },
      },
    },
  });
  await assertShipmentVisible(tenantId, role, userId, shipment);
  return shipment;
}

async function assertHubsInTenant(tenantId, originHubId, destinationHubId) {
  const [origin, dest] = await Promise.all([
    prisma.hub.findFirst({ where: { id: originHubId, tenantId } }),
    prisma.hub.findFirst({ where: { id: destinationHubId, tenantId } }),
  ]);
  if (!origin || !dest) {
    throw new HttpError(400, "Origin and destination hubs must belong to your organization");
  }
}

async function assertSenderInTenant(tenantId, senderId) {
  const user = await prisma.user.findFirst({
    where: { id: senderId, tenantId },
  });
  if (!user) {
    throw new HttpError(400, "Sender must be a user in your organization");
  }
}

async function assertTenantShipmentQuota(tenantId) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { subscriptionPlan: true },
  });
  if (!tenant?.subscriptionPlan) {
    throw new HttpError(400, "Tenant has no subscription plan");
  }
  const count = await prisma.shipment.count({ where: { tenantId } });
  if (count >= tenant.subscriptionPlan.maxShipments) {
    throw new HttpError(
      403,
      "Shipment limit reached for your subscription plan. Contact your administrator to upgrade."
    );
  }
}

async function createShipment({
  tenantId,
  role,
  actorUserId,
  trackingId,
  recipientName,
  recipientEmail: recipientEmailInput,
  recipientPhone,
  recipientAddress,
  originHubId,
  destinationHubId,
  estimatedDelivery,
  senderId: senderIdInput,
}) {
  await assertHubsInTenant(tenantId, originHubId, destinationHubId);

  let senderId = senderIdInput;
  if (role === UserRole.CUSTOMER) {
    senderId = actorUserId;
  }
  if (!senderId) {
    throw new HttpError(400, "senderId is required for this operation");
  }

  await assertSenderInTenant(tenantId, senderId);
  await assertTenantShipmentQuota(tenantId);

  const recipientEmail =
    recipientEmailInput != null && String(recipientEmailInput).trim() !== ""
      ? String(recipientEmailInput).trim()
      : null;

  const existing = await prisma.shipment.findUnique({
    where: { trackingId },
  });
  if (existing) {
    throw new HttpError(409, "This tracking ID is already in use");
  }

  const shipment = await prisma.$transaction(async (tx) => {
    const created = await tx.shipment.create({
      data: {
        tenantId,
        trackingId,
        senderId,
        recipientName,
        recipientEmail,
        recipientPhone,
        recipientAddress,
        originHubId,
        destinationHubId,
        status: ShipmentStatus.CREATED,
        estimatedDelivery: estimatedDelivery
          ? new Date(estimatedDelivery)
          : null,
      },
    });
    await tx.shipmentEvent.create({
      data: {
        shipmentId: created.id,
        status: ShipmentStatus.CREATED,
        note: "Shipment created",
      },
    });
    return created;
  });

  const full = await prisma.shipment.findUnique({
    where: { id: shipment.id },
    include: {
      events: { orderBy: { createdAt: "asc" } },
      sender: { select: { id: true, email: true } },
      originHub: true,
      destinationHub: true,
      tenant: { select: { name: true } },
    },
  });

  if (
    full?.recipientEmail ||
    full?.sender?.email ||
    full?.recipientPhone
  ) {
    void notifyShipmentParties({
      recipientEmail: full.recipientEmail,
      senderEmail: full.sender?.email,
      recipientPhone: full.recipientPhone,
      trackingId: full.trackingId,
      previousStatus: null,
      newStatus: ShipmentStatus.CREATED,
      tenantName: full.tenant?.name,
      recipientName: full.recipientName,
    });
  }

  void recordAudit({
    userId: actorUserId,
    tenantId,
    action: "SHIPMENT_CREATE",
    entity: "Shipment",
    entityId: shipment.id,
  });

  return full;
}

async function updateStatus({
  tenantId,
  role,
  userId,
  shipmentId,
  status: nextStatus,
  note,
  lat,
  lng,
}) {
  const shipment = await prisma.shipment.findFirst({
    where: { id: shipmentId, tenantId },
    include: { sender: { select: { email: true } } },
  });
  await assertShipmentVisible(tenantId, role, userId, shipment);

  assertValidTransition(shipment.status, nextStatus);

  const previousStatus = shipment.status;
  const updated = await prisma.$transaction(async (tx) => {
    const row = await tx.shipment.update({
      where: { id: shipment.id },
      data: {
        status: nextStatus,
      },
      include: {
        sender: { select: { email: true } },
        tenant: { select: { name: true } },
      },
    });
    await tx.shipmentEvent.create({
      data: {
        shipmentId: row.id,
        status: nextStatus,
        note: note || null,
        lat: lat != null ? Number(lat) : null,
        lng: lng != null ? Number(lng) : null,
      },
    });
    return row;
  });

  if (
    previousStatus !== nextStatus &&
    (updated.recipientEmail ||
      updated.sender?.email ||
      updated.recipientPhone)
  ) {
    void notifyShipmentParties({
      recipientEmail: updated.recipientEmail,
      senderEmail: updated.sender?.email,
      recipientPhone: updated.recipientPhone,
      trackingId: updated.trackingId,
      previousStatus,
      newStatus: nextStatus,
      tenantName: updated.tenant?.name,
      recipientName: updated.recipientName,
    });
  }

  void recordAudit({
    userId,
    tenantId,
    action: "SHIPMENT_STATUS_UPDATE",
    entity: "Shipment",
    entityId: shipmentId,
  });

  return getByIdForTenant(tenantId, role, userId, shipmentId);
}

async function assignAgent({ tenantId, role, userId, shipmentId, agentId }) {
  const shipment = await prisma.shipment.findFirst({
    where: { id: shipmentId, tenantId },
  });
  await assertShipmentVisible(tenantId, role, userId, shipment);

  if (agentId === null || agentId === undefined || agentId === "") {
    await prisma.shipment.update({
      where: { id: shipmentId },
      data: { assignedAgentId: null },
    });
    void recordAudit({
      userId,
      tenantId,
      action: "SHIPMENT_UNASSIGN_AGENT",
      entity: "Shipment",
      entityId: shipmentId,
    });
    return getByIdForTenant(tenantId, role, userId, shipmentId);
  }

  const agent = await prisma.agent.findFirst({
    where: { id: agentId, tenantId },
  });
  if (!agent) {
    throw new HttpError(400, "Agent not found in your organization");
  }

  await prisma.shipment.update({
    where: { id: shipmentId },
    data: { assignedAgentId: agent.id },
  });

  void recordAudit({
    userId,
    tenantId,
    action: "SHIPMENT_ASSIGN_AGENT",
    entity: "Shipment",
    entityId: shipmentId,
  });

  return getByIdForTenant(tenantId, role, userId, shipmentId);
}

async function createEventWithOptionalProof({
  tenantId,
  role,
  userId,
  shipmentId,
  status: statusInput,
  note,
  lat,
  lng,
  proofImageUrl,
}) {
  const shipment = await prisma.shipment.findFirst({
    where: { id: shipmentId, tenantId },
  });
  await assertShipmentVisible(tenantId, role, userId, shipment);

  const targetStatus =
    statusInput !== undefined && statusInput !== null && statusInput !== ""
      ? statusInput
      : shipment.status;

  if (targetStatus !== shipment.status) {
    assertValidTransition(shipment.status, targetStatus);
  }

  const previousStatus = shipment.status;

  const updated = await prisma.$transaction(async (tx) => {
    let rowWithMeta = null;
    if (targetStatus !== shipment.status) {
      rowWithMeta = await tx.shipment.update({
        where: { id: shipment.id },
        data: { status: targetStatus },
        include: {
          sender: { select: { email: true } },
          tenant: { select: { name: true } },
        },
      });
    }

    await tx.shipmentEvent.create({
      data: {
        shipmentId: shipment.id,
        status: targetStatus,
        note: note || null,
        proofImageUrl: proofImageUrl || null,
        lat: lat != null ? Number(lat) : null,
        lng: lng != null ? Number(lng) : null,
      },
    });

    return rowWithMeta;
  });

  if (
    previousStatus !== targetStatus &&
    (updated?.recipientEmail ||
      updated?.sender?.email ||
      updated?.recipientPhone)
  ) {
    void notifyShipmentParties({
      recipientEmail: updated.recipientEmail,
      senderEmail: updated.sender?.email,
      recipientPhone: updated.recipientPhone,
      trackingId: shipment.trackingId,
      previousStatus,
      newStatus: targetStatus,
      tenantName: updated.tenant?.name,
      recipientName: updated.recipientName,
    });
  }

  void recordAudit({
    userId,
    tenantId,
    action: proofImageUrl ? "SHIPMENT_PROOF_EVENT" : "SHIPMENT_EVENT",
    entity: "Shipment",
    entityId: shipmentId,
  });

  return getByIdForTenant(tenantId, role, userId, shipmentId);
}

async function updateShipmentHubs({
  tenantId,
  role,
  userId,
  shipmentId,
  originHubId: originInput,
  destinationHubId: destInput,
}) {
  if (role !== UserRole.COMPANY_ADMIN) {
    throw new HttpError(403, "Only company administrators can reassign hubs");
  }

  const shipment = await prisma.shipment.findFirst({
    where: { id: shipmentId, tenantId },
  });
  await assertShipmentVisible(tenantId, role, userId, shipment);

  const hasOrigin = originInput !== undefined && originInput !== null;
  const hasDest = destInput !== undefined && destInput !== null;
  if (!hasOrigin && !hasDest) {
    throw new HttpError(400, "Provide originHubId and/or destinationHubId");
  }

  const nextOrigin = hasOrigin ? String(originInput).trim() : shipment.originHubId;
  const nextDest = hasDest ? String(destInput).trim() : shipment.destinationHubId;

  if (
    nextOrigin === shipment.originHubId &&
    nextDest === shipment.destinationHubId
  ) {
    throw new HttpError(400, "No hub changes requested");
  }

  await assertHubsInTenant(tenantId, nextOrigin, nextDest);

  await prisma.$transaction(async (tx) => {
    await tx.shipment.update({
      where: { id: shipment.id },
      data: {
        originHubId: nextOrigin,
        destinationHubId: nextDest,
      },
    });
    await tx.shipmentEvent.create({
      data: {
        shipmentId: shipment.id,
        status: shipment.status,
        note: `Hubs updated (origin: ${nextOrigin}, destination: ${nextDest})`,
      },
    });
  });

  void recordAudit({
    userId,
    tenantId,
    action: "SHIPMENT_HUB_UPDATE",
    entity: "Shipment",
    entityId: shipmentId,
  });

  return getByIdForTenant(tenantId, role, userId, shipmentId);
}

async function getTrackingIdForQr(tenantId, role, userId, shipmentId) {
  const shipment = await prisma.shipment.findFirst({
    where: { id: shipmentId, tenantId },
    select: { trackingId: true, senderId: true },
  });
  await assertShipmentVisible(tenantId, role, userId, shipment);
  return shipment.trackingId;
}

async function lookupByTrackingForAssignedAgent(tenantId, userId, trackingIdRaw) {
  const trackingId = String(trackingIdRaw || "").trim();
  if (!trackingId) {
    throw new HttpError(400, "trackingId is required");
  }
  const agent = await prisma.agent.findFirst({
    where: { tenantId, userId },
  });
  if (!agent) {
    throw new HttpError(404, "Agent profile not found");
  }
  const shipment = await prisma.shipment.findFirst({
    where: {
      tenantId,
      trackingId,
      assignedAgentId: agent.id,
    },
    select: {
      id: true,
      trackingId: true,
      recipientName: true,
      recipientAddress: true,
      status: true,
      createdAt: true,
    },
  });
  if (!shipment) {
    throw new HttpError(
      404,
      "Shipment not found or not assigned to you"
    );
  }
  return shipment;
}

module.exports = {
  listForTenant,
  getByIdForTenant,
  createShipment,
  updateStatus,
  assignAgent,
  createEventWithOptionalProof,
  updateShipmentHubs,
  getTrackingIdForQr,
  lookupByTrackingForAssignedAgent,
  LEGACY_LIST_LIMIT,
};
