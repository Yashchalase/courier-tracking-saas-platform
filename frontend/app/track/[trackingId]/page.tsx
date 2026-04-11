"use client";

import * as React from "react";
import { useParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getApiErrorMessage } from "@/lib/api-error";
import api from "@/lib/axios";
import { formatShipmentStatus, statusBadgeVariant } from "@/lib/shipment-status";

type PublicTrackShipment = {
  trackingId: string;
  status: string;
  recipientName?: string;
  recipientAddress?: string;
  estimatedDelivery?: string | null;
  events?: {
    id?: string;
    status: string;
    note?: string | null;
    createdAt: string;
  }[];
};

type TrackApiResponse = {
  success?: boolean;
  data?: PublicTrackShipment | null;
  message?: string;
};

export default function TrackByIdPage() {
  const params = useParams<{ trackingId: string }>();
  const trackingId = params?.trackingId ? decodeURIComponent(params.trackingId) : "";

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [shipment, setShipment] = React.useState<PublicTrackShipment | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get<TrackApiResponse>(`/api/track/${trackingId}`);
        if (!cancelled) {
          const payload = data?.data;
          if (payload && typeof payload === "object" && payload.trackingId) {
            setShipment(payload);
          } else {
            setShipment(null);
            setError("Shipment not found.");
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            getApiErrorMessage(
              err,
              "We couldn't load this shipment. Check the link or try again later."
            )
          );
          setShipment(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [trackingId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50/40 via-background to-teal-50/40 dark:from-slate-950 dark:via-background dark:to-slate-950">
    <div className="mx-auto w-full max-w-3xl space-y-6 p-4 sm:p-8 pb-12">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tracking</h1>
          <p className="text-muted-foreground">
            Tracking ID: <span className="font-mono">{trackingId}</span>
          </p>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="rounded-md border bg-card p-6 text-sm text-muted-foreground">
          Loading…
        </div>
      ) : shipment ? (
        <Card>
          <CardHeader className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="font-mono text-lg">{shipment.trackingId}</CardTitle>
              <Badge variant={statusBadgeVariant(shipment.status)}>
                {formatShipmentStatus(shipment.status)}
              </Badge>
            </div>
            <CardDescription>
              {shipment.recipientName ? `Recipient: ${shipment.recipientName}` : " "}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {shipment.recipientAddress ? (
              <div className="text-sm">
                <p className="text-muted-foreground">Address</p>
                <p className="mt-1">{shipment.recipientAddress}</p>
              </div>
            ) : null}

            {shipment.events?.length ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">Events</p>
                <div className="space-y-2">
                  {shipment.events.map((e, i) => (
                    <div
                      key={e.id ?? `${e.createdAt}-${e.status}-${i}`}
                      className="rounded-md border bg-background p-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Badge variant={statusBadgeVariant(e.status)}>
                          {formatShipmentStatus(e.status)}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {new Date(e.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {e.note ? (
                        <p className="mt-2 text-sm text-muted-foreground">{e.note}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No events yet.</p>
            )}
          </CardContent>
        </Card>
      ) : null}

      <Button variant="outline" onClick={() => history.back()}>
        Back
      </Button>
    </div>
    </div>
  );
}

