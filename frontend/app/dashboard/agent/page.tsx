"use client";

import { AlertTriangle, MapPin, Package, RefreshCw } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { ShipmentCard } from "@/components/dashboard/agent/shipment-card";
import { ShipmentSkeletonGrid } from "@/components/dashboard/agent/shipment-skeleton-grid";
import { UpdateStatusDialog } from "@/components/dashboard/agent/update-status-dialog";
import {
  PROOF_NOTE,
  UploadProofDialog,
} from "@/components/dashboard/agent/upload-proof-dialog";
import { Button } from "@/components/ui/button";
import type { AgentShipment } from "@/lib/agent-shipment-utils";
import {
  canAdvanceDeliveryFlow,
  sortAgentShipments,
} from "@/lib/agent-shipment-utils";
import { getApiErrorMessage } from "@/lib/api-error";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/auth";

type AgentRow = {
  id: string;
  user: { id: string };
};

type ShipmentApiPayload = AgentShipment & {
  events?: Array<{ proofImageUrl?: string | null }>;
};

function latestProofUrlFromShipment(
  s: ShipmentApiPayload | null | undefined
): string | null {
  const evs = s?.events ?? [];
  for (let i = evs.length - 1; i >= 0; i--) {
    const u = evs[i]?.proofImageUrl;
    if (typeof u === "string" && u.length > 0) return u;
  }
  return null;
}

export default function AgentDashboardPage() {
  const user = useAuthStore((s) => s.user);

  const [agentId, setAgentId] = React.useState<string | null>(null);
  const [shipments, setShipments] = React.useState<AgentShipment[]>([]);
  const [proofByShipmentId, setProofByShipmentId] = React.useState<
    Record<string, string>
  >({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [statusDialogOpen, setStatusDialogOpen] = React.useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = React.useState(false);
  const [activeShipment, setActiveShipment] = React.useState<AgentShipment | null>(
    null
  );
  const [savingStatus, setSavingStatus] = React.useState(false);
  const [uploadingProof, setUploadingProof] = React.useState(false);
  const [locationSharing, setLocationSharing] = React.useState(false);
  const [liveSharing, setLiveSharing] = React.useState(false);
  const watchIdRef = React.useRef<number | null>(null);
  const lastLocationPostRef = React.useRef(0);

  const loadAgentId = React.useCallback(async () => {
    if (!user?.id) return null;
    try {
      const { data } = await api.get<{ agents: AgentRow[] }>("/api/agents");
      const me = (data.agents ?? []).find((a) => a.user?.id === user.id);
      return me?.id ?? null;
    } catch (err) {
      throw err;
    }
  }, [user?.id]);

  const loadShipments = React.useCallback(async (resolvedAgentId: string | null) => {
    setLoading(true);
    setError(null);
    try {
      if (!resolvedAgentId) {
        setShipments([]);
        setError(
          "We could not link your login to a delivery agent profile. Contact your admin."
        );
        return;
      }

      const { data } = await api.get<{ shipments: AgentShipment[] }>(
        "/api/shipments",
        { params: { assignedAgentId: resolvedAgentId } }
      );

      const rows = sortAgentShipments(data.shipments ?? []);
      setShipments(rows);
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Something went wrong while loading shipments.")
      );
      setShipments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshAll = React.useCallback(async () => {
    try {
      const id = await loadAgentId();
      setAgentId(id);
      await loadShipments(id);
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Could not refresh. Check your connection.")
      );
      setLoading(false);
    }
  }, [loadAgentId, loadShipments]);

  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const id = await loadAgentId();
        if (cancelled) return;
        setAgentId(id);
        await loadShipments(id);
      } catch (err) {
        if (cancelled) return;
        setError(
          getApiErrorMessage(err, "Could not load your agent profile or shipments.")
        );
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadAgentId, loadShipments]);

  React.useEffect(() => {
    return () => {
      if (
        watchIdRef.current != null &&
        typeof navigator !== "undefined" &&
        navigator.geolocation
      ) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  function openStatusDialog(shipment: AgentShipment) {
    setUploadDialogOpen(false);
    setActiveShipment(shipment);
    setStatusDialogOpen(true);
  }

  function stopLiveSharing() {
    if (watchIdRef.current != null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setLiveSharing(false);
    toast("Live location sharing stopped");
  }

  async function pushLocation(lat: number, lng: number) {
    if (!agentId) return;
    await api.patch(`/api/agents/${agentId}/location`, { lat, lng });
  }

  async function shareCurrentLocation() {
    if (!agentId) {
      toast.error("Your driver profile isn't ready yet. Try again in a moment.");
      return;
    }
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      toast.error("This device can't use location here. Try another browser.");
      return;
    }
    setLocationSharing(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await pushLocation(pos.coords.latitude, pos.coords.longitude);
          toast.success("Your location was shared with your team.");
        } catch (err) {
          toast.error(
            getApiErrorMessage(err, "Could not update location. Try again.")
          );
        } finally {
          setLocationSharing(false);
        }
      },
      () => {
        setLocationSharing(false);
        toast.error(
          "Location is off or blocked. Turn it on in your device settings."
        );
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 60_000 }
    );
  }

  function startLiveSharing() {
    if (!agentId) {
      toast.error("Your driver profile isn't ready yet. Try again in a moment.");
      return;
    }
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      toast.error("This device can't use location here. Try another browser.");
      return;
    }
    if (watchIdRef.current != null) {
      stopLiveSharing();
    }
    const minIntervalMs = 12_000;
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const now = Date.now();
        if (now - lastLocationPostRef.current < minIntervalMs) return;
        lastLocationPostRef.current = now;
        try {
          await pushLocation(pos.coords.latitude, pos.coords.longitude);
        } catch {
          /* avoid toast spam */
        }
      },
      () => {
        toast.error(
          "Live sharing stopped. Allow location for this site and try again."
        );
        stopLiveSharing();
      },
      { enableHighAccuracy: true, maximumAge: 15_000, timeout: 25_000 }
    );
    setLiveSharing(true);
    toast.success("Live sharing is on — your team can see you on the live map.");
  }

  function openUploadDialog(shipment: AgentShipment) {
    setStatusDialogOpen(false);
    setActiveShipment(shipment);
    setUploadDialogOpen(true);
  }

  async function handleConfirmStatus(nextStatus: string) {
    if (!activeShipment) return;
    setSavingStatus(true);
    try {
      await api.patch(`/api/shipments/${activeShipment.id}/status`, {
        status: nextStatus,
      });
      setStatusDialogOpen(false);
      setActiveShipment(null);
      toast.success("Status updated");
      await loadShipments(agentId);
    } catch (err) {
      toast.error(
        getApiErrorMessage(err, "Could not update status. Try again.")
      );
    } finally {
      setSavingStatus(false);
    }
  }

  async function handleUploadProof(file: File) {
    if (!activeShipment) return;
    setUploadingProof(true);
    try {
      const form = new FormData();
      form.append("proof", file);
      form.append("status", activeShipment.status);
      form.append("note", PROOF_NOTE);

      const { data } = await api.post<{ shipment: ShipmentApiPayload }>(
        `/api/shipments/${activeShipment.id}/events`,
        form,
        {
          transformRequest: [
            (data, headers) => {
              if (typeof FormData !== "undefined" && data instanceof FormData) {
                const h = headers as Record<string, string | undefined>;
                delete h["Content-Type"];
              }
              return data;
            },
          ],
        }
      );

      const url = latestProofUrlFromShipment(data.shipment);
      if (url) {
        setProofByShipmentId((prev) => ({
          ...prev,
          [activeShipment.id]: url,
        }));
      }

      setUploadDialogOpen(false);
      setActiveShipment(null);
      toast.success("Proof uploaded");
      await loadShipments(agentId);
    } catch (err) {
      toast.error(
        getApiErrorMessage(err, "Could not upload proof. Try again.")
      );
    } finally {
      setUploadingProof(false);
    }
  }

  const showEmpty =
    !loading && !error && agentId && shipments.length === 0;
  const showGrid = !loading && !error && shipments.length > 0;

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-background via-background to-muted/40 p-6 shadow-sm sm:p-8">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/[0.06] blur-3xl"
          aria-hidden
        />
        <div className="relative space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Field ops
          </p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Today&apos;s route
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Prioritized stops, quick status updates, and proof capture — built
            for fast on-the-ground delivery.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={!agentId || loading || locationSharing || liveSharing}
              onClick={() => void shareCurrentLocation()}
            >
              <MapPin
                className={`h-4 w-4 ${locationSharing ? "animate-pulse" : ""}`}
                aria-hidden
              />
              {locationSharing ? "Getting location…" : "Share once"}
            </Button>
            {liveSharing ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="gap-2"
                onClick={() => stopLiveSharing()}
              >
                <MapPin className="h-4 w-4 animate-pulse" aria-hidden />
                Stop live sharing
              </Button>
            ) : (
              <Button
                type="button"
                variant="default"
                size="sm"
                className="gap-2"
                disabled={!agentId || loading || locationSharing}
                onClick={() => startLiveSharing()}
              >
                <MapPin className="h-4 w-4" aria-hidden />
                Start live sharing
              </Button>
            )}
            <p className="w-full max-w-xl text-xs text-muted-foreground">
              Share once sends your current location a single time. Live sharing
              updates about every 12 seconds while you stay on this screen so your
              team can follow you on Live map.
            </p>
          </div>
        </div>
      </section>

      {error ? (
        <div
          role="alert"
          className="flex flex-col gap-4 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
        >
          <div className="flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive">
              <AlertTriangle className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0 space-y-1">
              <p className="font-semibold text-destructive">Couldn&apos;t load data</p>
              <p className="text-sm text-destructive/90">{error}</p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            className="shrink-0 gap-2 border-destructive/40 bg-background hover:bg-destructive/5"
            onClick={() => void refreshAll()}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              aria-hidden
            />
            Retry
          </Button>
        </div>
      ) : null}

      {loading ? (
        <ShipmentSkeletonGrid count={6} />
      ) : showEmpty ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-16 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Package className="h-8 w-8" strokeWidth={1.5} aria-hidden />
          </span>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-foreground">
              No shipments assigned
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              You&apos;re all caught up! New stops will show up here when your
              dispatcher assigns them.
            </p>
          </div>
        </div>
      ) : null}

      {showGrid ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shipments.map((s) => (
            <ShipmentCard
              key={s.id}
              shipment={s}
              proofPreviewUrl={proofByShipmentId[s.id] ?? null}
              onUpdateStatus={() => openStatusDialog(s)}
              onUploadProof={() => openUploadDialog(s)}
              statusBusy={savingStatus && activeShipment?.id === s.id}
              uploadBusy={uploadingProof && activeShipment?.id === s.id}
              statusUpdateDisabled={!canAdvanceDeliveryFlow(s.status)}
              uploadDisabled={
                (uploadingProof || savingStatus) &&
                activeShipment?.id === s.id
              }
            />
          ))}
        </div>
      ) : null}

      <UpdateStatusDialog
        open={statusDialogOpen}
        onOpenChange={(o) => {
          setStatusDialogOpen(o);
          if (!o) setActiveShipment(null);
        }}
        shipment={activeShipment}
        submitting={savingStatus}
        onConfirm={(next) => void handleConfirmStatus(next)}
      />

      <UploadProofDialog
        open={uploadDialogOpen}
        onOpenChange={(o) => {
          setUploadDialogOpen(o);
          if (!o) setActiveShipment(null);
        }}
        shipment={activeShipment}
        submitting={uploadingProof}
        onSubmit={(file) => handleUploadProof(file)}
      />
    </div>
  );
}
