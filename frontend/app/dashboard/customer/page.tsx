"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getApiErrorMessage } from "@/lib/api-error";
import api from "@/lib/axios";
import { formatShipmentStatus, statusBadgeVariant } from "@/lib/shipment-status";

type ShipmentRow = {
  id: string;
  trackingId: string;
  status: string;
  createdAt: string;
};

export default function CustomerDashboardPage() {
  const router = useRouter();
  const [shipments, setShipments] = React.useState<ShipmentRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get<{ shipments: ShipmentRow[] }>("/api/shipments");
        if (!cancelled) setShipments(data.shipments ?? []);
      } catch (err) {
        if (!cancelled) {
          setError(
            getApiErrorMessage(
              err,
              "We couldn't load your shipments. Try again."
            )
          );
          setShipments([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My shipments</h1>
        <p className="text-muted-foreground">
          Click any row to view live tracking details.
        </p>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tracking ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : shipments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No shipments found.
                </TableCell>
              </TableRow>
            ) : (
              shipments.map((s) => (
                <TableRow
                  key={s.id}
                  role="button"
                  tabIndex={0}
                  className="cursor-pointer"
                  onClick={() =>
                    router.push(
                      `/dashboard/customer/track/${encodeURIComponent(s.trackingId)}`
                    )
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      router.push(
                        `/dashboard/customer/track/${encodeURIComponent(s.trackingId)}`
                      );
                    }
                  }}
                >
                  <TableCell className="font-mono text-sm">{s.trackingId}</TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant(s.status)}>
                      {formatShipmentStatus(s.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {new Date(s.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
