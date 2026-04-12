"use client";

import Link from "next/link";

import { TrackShipmentForm } from "@/components/track/track-shipment-form";

export default function CustomerTrackPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Track a shipment</h1>
        <p className="text-muted-foreground">
          Enter a tracking number to see live status and delivery updates.
        </p>
      </div>

      <TrackShipmentForm
        buildTrackingUrl={(id) =>
          `/dashboard/customer/track/${encodeURIComponent(id)}`
        }
        formClassName="bg-card"
      />

      <p className="text-sm text-muted-foreground">
        <Link
          href="/dashboard/customer"
          className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
        >
          Back to my shipments
        </Link>
      </p>
    </div>
  );
}
