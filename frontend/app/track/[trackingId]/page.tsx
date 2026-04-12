"use client";

import { useParams } from "next/navigation";

import { TrackShipmentDetail } from "@/components/track/track-shipment-detail";

export default function TrackByIdPage() {
  const params = useParams<{ trackingId: string }>();
  const trackingId = params?.trackingId ? decodeURIComponent(params.trackingId) : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50/40 via-background to-teal-50/40 dark:from-slate-950 dark:via-background dark:to-slate-950">
      <div className="p-4 sm:p-8">
        <TrackShipmentDetail trackingId={trackingId} />
      </div>
    </div>
  );
}
