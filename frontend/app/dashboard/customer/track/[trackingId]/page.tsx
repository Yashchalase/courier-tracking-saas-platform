"use client";

import { useParams } from "next/navigation";

import { TrackShipmentDetail } from "@/components/track/track-shipment-detail";

export default function CustomerTrackByIdPage() {
  const params = useParams<{ trackingId: string }>();
  const trackingId = params?.trackingId ? decodeURIComponent(params.trackingId) : "";

  return (
    <TrackShipmentDetail
      trackingId={trackingId}
      backHref="/dashboard/customer/track"
      backLabel="Back to track search"
    />
  );
}
