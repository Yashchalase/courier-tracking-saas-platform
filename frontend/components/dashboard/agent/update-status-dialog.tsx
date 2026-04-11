"use client";

import { CheckCircle2, MapPinned, Package, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AgentShipment } from "@/lib/agent-shipment-utils";
import {
  formatShipmentStatus,
  getDeliveryFlowNextStatus,
} from "@/lib/agent-shipment-utils";
import { cn } from "@/lib/utils";

function iconForNextStatus(status: string): LucideIcon {
  switch (status) {
    case "PICKED_UP":
      return Package;
    case "IN_TRANSIT":
      return Truck;
    case "OUT_FOR_DELIVERY":
      return MapPinned;
    case "DELIVERED":
      return CheckCircle2;
    default:
      return Package;
  }
}

type UpdateStatusDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shipment: AgentShipment | null;
  submitting?: boolean;
  onConfirm: (nextStatus: string) => void;
};

export function UpdateStatusDialog({
  open,
  onOpenChange,
  shipment,
  submitting,
  onConfirm,
}: UpdateStatusDialogProps) {
  const nextStatus = shipment ? getDeliveryFlowNextStatus(shipment.status) : null;
  const NextIcon = nextStatus ? iconForNextStatus(nextStatus) : Package;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "fixed bottom-0 left-0 right-0 top-auto z-50 flex max-h-[min(88vh,640px)] w-full max-w-none translate-y-0 flex-col gap-0 overflow-hidden rounded-t-2xl border border-border/80 bg-background p-0 shadow-2xl duration-300",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-bottom-4 data-[state=open]:slide-in-from-bottom-8",
          "sm:bottom-auto sm:left-1/2 sm:right-auto sm:top-1/2 sm:max-h-[85vh] sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:data-[state=open]:slide-in-from-bottom-0 sm:data-[state=open]:zoom-in-95 sm:data-[state=closed]:slide-out-to-bottom-0 sm:data-[state=closed]:zoom-out-95"
        )}
      >
        <div className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-muted-foreground/25 sm:hidden" />

        <div className="max-h-[inherit] overflow-y-auto p-6 pb-8 sm:pb-6">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="text-xl font-semibold tracking-tight">
              Update status
            </DialogTitle>
            <DialogDescription className="text-base leading-relaxed">
              {shipment ? (
                <>
                  <span className="font-mono font-medium text-foreground">
                    {shipment.trackingId}
                  </span>
                  <span className="text-muted-foreground">
                    {" "}
                    — move this shipment forward on the delivery route.
                  </span>
                </>
              ) : (
                "Select the next step for this delivery."
              )}
            </DialogDescription>
          </DialogHeader>

          {shipment && nextStatus ? (
            <div className="mt-8 space-y-4">
              <p className="text-sm font-medium text-muted-foreground">
                Current:{" "}
                <span className="text-foreground">
                  {formatShipmentStatus(shipment.status)}
                </span>
              </p>

              <Button
                type="button"
                size="lg"
                className="h-auto w-full flex-col gap-3 rounded-2xl py-6 text-base font-semibold shadow-md transition-all hover:scale-[1.01] active:scale-[0.99]"
                disabled={submitting}
                onClick={() => onConfirm(nextStatus)}
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-foreground/15">
                  <NextIcon className="h-7 w-7" aria-hidden />
                </span>
                <span className="flex flex-col gap-0.5">
                  <span>Set to {formatShipmentStatus(nextStatus)}</span>
                  <span className="text-xs font-normal opacity-90">
                    Confirms this milestone on the route
                  </span>
                </span>
              </Button>
            </div>
          ) : shipment ? (
            <p className="mt-6 text-sm text-muted-foreground">
              No further steps on the standard delivery path for this shipment.
            </p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
