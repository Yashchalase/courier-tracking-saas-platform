import type { VariantProps } from "class-variance-authority";

import { badgeVariants } from "@/components/ui/badge";

export const SHIPMENT_STATUSES = [
  "CREATED",
  "PICKED_UP",
  "AT_SORTING_FACILITY",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "FAILED",
  "RETURNED",
] as const;

export type ShipmentStatus = (typeof SHIPMENT_STATUSES)[number];

export function formatShipmentStatus(status: string): string {
  return status.replace(/_/g, " ");
}

export function statusBadgeVariant(
  status: string
): VariantProps<typeof badgeVariants>["variant"] {
  switch (status) {
    case "DELIVERED":
      return "success";
    case "FAILED":
    case "RETURNED":
      return "destructive";
    case "OUT_FOR_DELIVERY":
    case "IN_TRANSIT":
    case "PICKED_UP":
    case "AT_SORTING_FACILITY":
      return "warning";
    default:
      return "secondary";
  }
}
