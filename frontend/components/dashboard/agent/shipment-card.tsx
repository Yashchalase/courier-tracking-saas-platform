"use client";

import { CalendarDays, Camera, MapPin, Package, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import type { AgentShipment } from "@/lib/agent-shipment-utils";
import {
  formatShipmentDate,
  formatShipmentStatus,
  statusBadgeClasses,
} from "@/lib/agent-shipment-utils";
import { cn } from "@/lib/utils";

type ShipmentCardProps = {
  shipment: AgentShipment;
  proofPreviewUrl?: string | null;
  onUpdateStatus: () => void;
  onUploadProof: () => void;
  statusBusy?: boolean;
  uploadBusy?: boolean;
  statusUpdateDisabled?: boolean;
  uploadDisabled?: boolean;
};

export function ShipmentCard({
  shipment,
  proofPreviewUrl,
  onUpdateStatus,
  onUploadProof,
  statusBusy,
  uploadBusy,
  statusUpdateDisabled,
  uploadDisabled,
}: ShipmentCardProps) {
  return (
    <Card
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm",
        "transition-all duration-300 ease-out hover:shadow-lg hover:border-border"
      )}
    >
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Tracking
            </p>
            <p className="truncate font-mono text-base font-bold tracking-tight text-foreground">
              {shipment.trackingId}
            </p>
          </div>
          <Badge
            className={cn(
              "shrink-0 px-2.5 py-0.5 text-xs font-medium",
              statusBadgeClasses(shipment.status)
            )}
          >
            {formatShipmentStatus(shipment.status)}
          </Badge>
        </div>

        <div className="flex items-start gap-2 text-sm">
          <User
            className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
            aria-hidden
          />
          <span className="font-medium leading-snug text-foreground">
            {shipment.recipientName}
          </span>
        </div>

        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin
            className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/80"
            aria-hidden
          />
          <p className="line-clamp-2 min-h-[2.5rem] leading-relaxed">
            {shipment.recipientAddress}
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5" aria-hidden />
          <span>Created {formatShipmentDate(shipment.createdAt)}</span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-3 border-t border-border/50 bg-muted/20 px-6 py-4">
        {proofPreviewUrl ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border/60 bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element -- blob / external CDN proof URLs */}
            <img
              src={proofPreviewUrl}
              alt="Delivery proof"
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-xl border border-dashed border-border/80 bg-background/50 px-3 py-2.5 text-xs text-muted-foreground">
            <Package className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
            <span>No proof uploaded yet for this stop.</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="grid grid-cols-2 gap-2 border-t border-border/50 bg-card px-4 py-4 sm:px-6">
        <Button
          type="button"
          variant="default"
          size="sm"
          className="h-10 rounded-xl font-medium shadow-sm transition-transform active:scale-[0.98]"
          onClick={onUpdateStatus}
          disabled={statusUpdateDisabled || statusBusy}
        >
          {statusBusy ? "Updating…" : "Update status"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-10 gap-1.5 rounded-xl border-border/80 font-medium transition-transform active:scale-[0.98]"
          onClick={onUploadProof}
          disabled={uploadDisabled || uploadBusy}
        >
          <Camera className="h-4 w-4" aria-hidden />
          {uploadBusy ? "Uploading…" : "Upload proof"}
        </Button>
      </CardFooter>
    </Card>
  );
}
