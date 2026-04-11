"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/lib/api-error";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/auth";

export type HubOption = {
  id: string;
  name: string;
  city: string;
};

function generateTrackingId(): string {
  const part =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 12)
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  return `TRK-${part}`.toUpperCase();
}

type CreateShipmentModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hubs: HubOption[];
  onCreated?: () => void;
};

export function CreateShipmentModal({
  open,
  onOpenChange,
  hubs,
  onCreated,
}: CreateShipmentModalProps) {
  const user = useAuthStore((s) => s.user);
  const [recipientName, setRecipientName] = React.useState("");
  const [recipientEmail, setRecipientEmail] = React.useState("");
  const [recipientPhone, setRecipientPhone] = React.useState("");
  const [recipientAddress, setRecipientAddress] = React.useState("");
  const [originHubId, setOriginHubId] = React.useState("");
  const [destinationHubId, setDestinationHubId] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [createdTrackingId, setCreatedTrackingId] = React.useState<
    string | null
  >(null);
  const [qrUrl, setQrUrl] = React.useState<string | null>(null);
  const [estimatedDeliveryLocal, setEstimatedDeliveryLocal] =
    React.useState("");
  const [predictionText, setPredictionText] = React.useState<string | null>(
    null
  );
  const [predictionIso, setPredictionIso] = React.useState<string | null>(
    null
  );
  const [predictionLoading, setPredictionLoading] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      setRecipientName("");
      setRecipientEmail("");
      setRecipientPhone("");
      setRecipientAddress("");
      setOriginHubId("");
      setDestinationHubId("");
      setError(null);
      setSubmitting(false);
      setCreatedTrackingId(null);
      setQrUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setEstimatedDeliveryLocal("");
      setPredictionText(null);
      setPredictionIso(null);
    }
  }, [open]);

  React.useEffect(() => {
    if (!open || !originHubId || !destinationHubId || originHubId === destinationHubId) {
      setPredictionText(null);
      setPredictionIso(null);
      return;
    }
    const ac = new AbortController();
    setPredictionLoading(true);
    void (async () => {
      try {
        const { data } = await api.get<{
          prediction: {
            suggestedEstimatedDelivery: string | null;
            message?: string;
            sampleSize: number;
            medianHours: number | null;
          };
        }>("/api/shipments/predicted-eta", {
          params: { originHubId, destinationHubId },
          signal: ac.signal,
        });
        const p = data.prediction;
        setPredictionText(p.message ?? null);
        setPredictionIso(p.suggestedEstimatedDelivery ?? null);
      } catch {
        if (!ac.signal.aborted) {
          setPredictionText(null);
          setPredictionIso(null);
        }
      } finally {
        if (!ac.signal.aborted) setPredictionLoading(false);
      }
    })();
    return () => ac.abort();
  }, [open, originHubId, destinationHubId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id) {
      setError("You must be signed in to create a shipment.");
      return;
    }
    if (!originHubId || !destinationHubId) {
      setError("Select origin and destination hubs.");
      return;
    }
    const emailTrim = recipientEmail.trim();
    if (!emailTrim) {
      setError("Recipient email is required for delivery updates.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const trackingId = generateTrackingId();
      const body: Record<string, unknown> = {
        trackingId,
        recipientName: recipientName.trim(),
        recipientEmail: emailTrim,
        recipientPhone: recipientPhone.trim(),
        recipientAddress: recipientAddress.trim(),
        originHubId,
        destinationHubId,
        senderId: user.id,
      };
      if (estimatedDeliveryLocal.trim()) {
        body.estimatedDelivery = new Date(
          estimatedDeliveryLocal
        ).toISOString();
      }
      const { data } = await api.post<{ shipment: { id: string; trackingId: string } }>(
        "/api/shipments",
        body
      );
      const shipment = data.shipment;
      setCreatedTrackingId(shipment.trackingId);

      const qrRes = await api.get(`/api/shipments/${shipment.id}/qr`, {
        responseType: "blob",
      });
      const blob = qrRes.data as Blob;
      const url = URL.createObjectURL(blob);
      setQrUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
      onCreated?.();
    } catch (err: unknown) {
      setError(
        getApiErrorMessage(err, "Could not create shipment.")
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    onOpenChange(false);
  }

  const success = Boolean(createdTrackingId && qrUrl);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        {success ? (
          <>
            <DialogHeader>
              <DialogTitle>Shipment created</DialogTitle>
              <DialogDescription>
                Tracking ID:{" "}
                <span className="font-mono font-medium text-foreground">
                  {createdTrackingId}
                </span>
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrUrl!}
                alt="Shipment QR code"
                className="h-48 w-48 rounded-md border bg-white p-2"
              />
              <p className="text-center text-sm text-muted-foreground">
                Scan to open the public tracking link for this shipment.
              </p>
            </div>
            <DialogFooter>
              <Button type="button" onClick={handleClose}>
                Done
              </Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Create shipment</DialogTitle>
              <DialogDescription>
                Add recipient details and route between hubs. A tracking ID is
                generated automatically.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {error ? (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              ) : null}
              <div className="grid gap-2">
                <Label htmlFor="recipientName">Recipient name</Label>
                <Input
                  id="recipientName"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="recipientEmail">Recipient email</Label>
                <Input
                  id="recipientEmail"
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="notifications sent here"
                />
                <p className="text-xs text-muted-foreground">
                  Status updates are emailed to this address (and SMS if configured).
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="recipientPhone">Recipient phone</Label>
                <Input
                  id="recipientPhone"
                  type="tel"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="recipientAddress">Recipient address</Label>
                <Textarea
                  id="recipientAddress"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  required
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label>Origin hub</Label>
                <Select
                  required
                  value={originHubId}
                  onValueChange={setOriginHubId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select origin hub" />
                  </SelectTrigger>
                  <SelectContent>
                    {hubs.map((h) => (
                      <SelectItem key={h.id} value={h.id}>
                        {h.name} — {h.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Destination hub</Label>
                <Select
                  required
                  value={destinationHubId}
                  onValueChange={setDestinationHubId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination hub" />
                  </SelectTrigger>
                  <SelectContent>
                    {hubs.map((h) => (
                      <SelectItem key={h.id} value={h.id}>
                        {h.name} — {h.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {(predictionLoading || predictionText) && originHubId && destinationHubId ? (
                <div className="rounded-lg border border-border/80 bg-muted/40 px-3 py-2 text-sm">
                  <p className="font-medium text-foreground">
                    Suggested delivery time
                  </p>
                  <p className="text-muted-foreground">
                    {predictionLoading
                      ? "Looking at how long similar deliveries took…"
                      : predictionText}
                  </p>
                  {predictionIso && !predictionLoading ? (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        const d = new Date(predictionIso);
                        const tz = d.getTimezoneOffset() * 60000;
                        const local = new Date(d.getTime() - tz);
                        setEstimatedDeliveryLocal(
                          local.toISOString().slice(0, 16)
                        );
                      }}
                    >
                      Use suggested delivery time
                    </Button>
                  ) : null}
                </div>
              ) : null}
              <div className="grid gap-2">
                <Label htmlFor="est-delivery">Estimated delivery (optional)</Label>
                <Input
                  id="est-delivery"
                  type="datetime-local"
                  value={estimatedDeliveryLocal}
                  onChange={(e) => setEstimatedDeliveryLocal(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || hubs.length < 1}>
                {submitting ? "Creating…" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
