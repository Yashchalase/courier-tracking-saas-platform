export type AgentShipment = {
  id: string;
  trackingId: string;
  recipientName: string;
  recipientAddress: string;
  status: string;
  createdAt: string;
};

/** Sort: OUT_FOR_DELIVERY > IN_TRANSIT > PICKED_UP > CREATED; other statuses after. */
const STATUS_SORT_PRIORITY: Record<string, number> = {
  OUT_FOR_DELIVERY: 1,
  IN_TRANSIT: 2,
  PICKED_UP: 3,
  CREATED: 4,
  AT_SORTING_FACILITY: 5,
  FAILED: 6,
  RETURNED: 7,
  DELIVERED: 8,
};

export function sortAgentShipments(shipments: AgentShipment[]): AgentShipment[] {
  return shipments.slice().sort((a, b) => {
    const pa = STATUS_SORT_PRIORITY[a.status] ?? 50;
    const pb = STATUS_SORT_PRIORITY[b.status] ?? 50;
    if (pa !== pb) return pa - pb;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

/**
 * Single next step on the primary delivery path (matches agent UI flow).
 * Backend may allow other transitions; this UI intentionally follows the happy path.
 */
const DELIVERY_FLOW_NEXT: Record<string, string> = {
  CREATED: "PICKED_UP",
  PICKED_UP: "IN_TRANSIT",
  IN_TRANSIT: "OUT_FOR_DELIVERY",
  OUT_FOR_DELIVERY: "DELIVERED",
  AT_SORTING_FACILITY: "IN_TRANSIT",
};

export function getDeliveryFlowNextStatus(
  current: string
): string | null {
  const next = DELIVERY_FLOW_NEXT[current];
  return next ?? null;
}

export function canAdvanceDeliveryFlow(status: string): boolean {
  return getDeliveryFlowNextStatus(status) !== null;
}

export function statusBadgeClasses(status: string): string {
  switch (status) {
    case "CREATED":
      return "border-transparent bg-slate-100 text-slate-800 shadow-none dark:bg-slate-800/80 dark:text-slate-100";
    case "PICKED_UP":
      return "border-transparent bg-blue-100 text-blue-950 shadow-none dark:bg-blue-950/60 dark:text-blue-50";
    case "IN_TRANSIT":
      return "border-transparent bg-purple-100 text-purple-950 shadow-none dark:bg-purple-950/60 dark:text-purple-50";
    case "OUT_FOR_DELIVERY":
      return "border-transparent bg-amber-100 text-amber-950 shadow-none dark:bg-amber-950/50 dark:text-amber-50";
    case "DELIVERED":
      return "border-transparent bg-emerald-100 text-emerald-900 shadow-none dark:bg-emerald-950/50 dark:text-emerald-100";
    case "FAILED":
      return "border-transparent bg-red-100 text-red-900 shadow-none dark:bg-red-950/60 dark:text-red-50";
    case "AT_SORTING_FACILITY":
      return "border-transparent bg-violet-100 text-violet-900 shadow-none dark:bg-violet-950/50 dark:text-violet-100";
    case "RETURNED":
      return "border-transparent bg-orange-100 text-orange-900 shadow-none dark:bg-orange-950/50 dark:text-orange-100";
    default:
      return "border-transparent bg-secondary text-secondary-foreground shadow-none";
  }
}

export function formatShipmentDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export { formatShipmentStatus } from "@/lib/shipment-status";
