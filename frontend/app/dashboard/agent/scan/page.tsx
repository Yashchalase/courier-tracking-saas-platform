"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, ScanLine } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/api-error";
import api from "@/lib/axios";

import "./scan-qr-theme.css";

function extractTrackingId(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  const upper = t.toUpperCase();
  const direct = upper.match(/\b(TRK-[A-Z0-9]+)\b/);
  if (direct) return direct[1]!;
  try {
    const u = new URL(t, "https://placeholder.local");
    const segs = u.pathname.split("/").filter(Boolean);
    const last = segs[segs.length - 1];
    if (last && /^TRK-/i.test(last)) {
      return decodeURIComponent(last).toUpperCase();
    }
  } catch {
    /* ignore */
  }
  return null;
}

const FRIENDLY_NO_CODE_IN_IMAGE =
  "No QR code or barcode was found in this image. Try a clearer photo of the shipping label, use the camera, or type the tracking code below.";

const FRIENDLY_CAMERA_BLOCKED =
  "Camera access was blocked. Allow the camera in your browser settings, or choose an image file instead.";

/** html5-qrcode ships typo "choosen" — fix visible text only. */
function fixScannerTypos(root: HTMLElement | null) {
  if (!root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node: Node | null = walker.nextNode();
  while (node) {
    if (node.nodeValue?.includes("choosen")) {
      node.nodeValue = node.nodeValue.replace(/choosen/g, "chosen");
    }
    node = walker.nextNode();
  }
}

/**
 * Replace raw library exception strings in the header banner with plain language,
 * and tag the node so CSS can use theme colors instead of inline GitHub-red.
 */
function humanizeScannerHeader(root: HTMLElement | null) {
  if (!root) return;
  const msg = root.querySelector<HTMLElement>('[id$="__header_message"]');
  if (!msg) return;

  if (msg.style.display === "none") {
    delete msg.dataset.scanMsg;
    return;
  }

  const t = msg.textContent ?? "";

  if (t === "Loading image..." || /^Loading\b/i.test(t)) {
    delete msg.dataset.scanMsg;
    return;
  }

  if (
    t.includes("No QR code or barcode was found in this image") ||
    t.includes("Camera access was blocked")
  ) {
    msg.dataset.scanMsg = "soft-warning";
    return;
  }

  if (
    /NotFoundException/i.test(t) ||
    /MultiFormat Readers/i.test(t) ||
    /detect the code/i.test(t)
  ) {
    msg.textContent = FRIENDLY_NO_CODE_IN_IMAGE;
    msg.dataset.scanMsg = "soft-warning";
    return;
  }

  if (
    /NotAllowedError/i.test(t) ||
    /Permission denied/i.test(t) ||
    /not allowed by the user agent/i.test(t)
  ) {
    msg.textContent = FRIENDLY_CAMERA_BLOCKED;
    msg.dataset.scanMsg = "soft-warning";
    return;
  }

  delete msg.dataset.scanMsg;
}

function normalizeScannerDom(root: HTMLElement | null) {
  fixScannerTypos(root);
  humanizeScannerHeader(root);
}

type LookupShipment = {
  id: string;
  trackingId: string;
  recipientName: string;
  recipientAddress: string;
  status: string;
  createdAt: string;
};

export default function AgentScanPage() {
  const [manualId, setManualId] = React.useState("");
  const [found, setFound] = React.useState<LookupShipment | null>(null);
  const [busy, setBusy] = React.useState(false);
  const lookupRef = React.useRef<(trackingId: string) => void>(() => {});
  const scannerRef = React.useRef<import("html5-qrcode").Html5QrcodeScanner | null>(
    null
  );

  const lookup = React.useCallback(async (trackingId: string) => {
    const id = trackingId.trim();
    if (!id) return;
    setBusy(true);
    setFound(null);
    try {
      const { data } = await api.get<{ shipment: LookupShipment }>(
        "/api/shipments/agent-lookup",
        { params: { trackingId: id } }
      );
      setFound(data.shipment);
      toast.success("Found it — this delivery is on your list.");
    } catch (err) {
      toast.error(
        getApiErrorMessage(
          err,
          "This code doesn't match a delivery on your list. Check the label or ask your office."
        )
      );
    } finally {
      setBusy(false);
    }
  }, []);

  lookupRef.current = (tid: string) => {
    void lookup(tid);
  };

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;
    let typoObserver: MutationObserver | null = null;

    void (async () => {
      const { Html5QrcodeScanner } = await import("html5-qrcode");
      if (cancelled) return;

      const scanner = new Html5QrcodeScanner(
        "agent-qr-reader",
        {
          fps: 8,
          qrbox: { width: 260, height: 260 },
          rememberLastUsedCamera: true,
        },
        false
      );
      scannerRef.current = scanner;

      scanner.render(
        (decoded) => {
          const tid = extractTrackingId(decoded);
          if (tid) lookupRef.current(tid);
          else
            toast.error(
              "We couldn't read a shipment code from this image. Try again or type the code below."
            );
        },
        () => {
          /* scan errors — ignore frame noise */
        }
      );

      const root = document.getElementById("agent-qr-reader");
      const runDomFix = () => normalizeScannerDom(root);
      runDomFix();
      [50, 200, 600].forEach((ms) => setTimeout(runDomFix, ms));
      if (root) {
        typoObserver = new MutationObserver(() => runDomFix());
        typoObserver.observe(root, {
          childList: true,
          subtree: true,
          characterData: true,
        });
      }
    })();

    return () => {
      cancelled = true;
      typoObserver?.disconnect();
      void scannerRef.current?.clear().catch(() => {});
      scannerRef.current = null;
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-xl space-y-6 px-0 sm:px-1">
      <header className="flex flex-col gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-start sm:gap-4">
        <Button variant="ghost" size="icon" asChild className="mt-0.5 shrink-0">
          <Link href="/dashboard/agent" aria-label="Back to dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ScanLine className="h-4 w-4" aria-hidden />
            </span>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Scan shipment
            </h1>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-[0.9375rem]">
            Use the camera on the label, upload a photo, or type the tracking
            code — only deliveries on your run will match.
          </p>
        </div>
      </header>

      <Card className="border-border/80 shadow-sm shadow-slate-900/[0.04] dark:shadow-black/20">
        <CardHeader className="space-y-1 pb-3">
          <CardTitle className="text-base sm:text-lg">Camera or image</CardTitle>
          <CardDescription className="text-muted-foreground/95">
            Allow camera access when your browser asks. You can switch to an
            image file if the camera is not available.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="agent-qr-scanner">
            <div id="agent-qr-reader" className="min-h-[120px]" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm shadow-slate-900/[0.04] dark:shadow-black/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Type the code</CardTitle>
          <CardDescription>
            Enter the code from the label (for example{" "}
            <span className="font-mono text-foreground/90">TRK-…</span>).
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              className="h-11 min-h-11 flex-1 font-mono text-sm sm:min-w-0"
              placeholder="TRK-XXXXXXXXXXXX"
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && manualId.trim() && !busy) {
                  const tid = extractTrackingId(manualId) ?? manualId.trim();
                  void lookup(tid);
                }
              }}
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              aria-label="Tracking code"
            />
            <Button
              type="button"
              className="h-11 w-full shrink-0 font-semibold sm:w-auto sm:min-w-[7.5rem]"
              disabled={busy || !manualId.trim()}
              onClick={() => {
                const tid = extractTrackingId(manualId) ?? manualId.trim();
                void lookup(tid);
              }}
            >
              {busy ? "Looking up…" : "Look up"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {found ? (
        <Card className="border-primary/35 bg-primary/[0.06] shadow-sm dark:bg-primary/[0.08]">
          <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-2">
            <CheckCircle2
              className="mt-0.5 h-5 w-5 shrink-0 text-primary"
              aria-hidden
            />
            <div className="min-w-0 space-y-1">
              <CardTitle className="break-all font-mono text-base">
                {found.trackingId}
              </CardTitle>
              <CardDescription className="text-foreground/80">
                {found.recipientName} · {found.status.replace(/_/g, " ")}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="leading-relaxed text-muted-foreground">
              {found.recipientAddress}
            </p>
            <Button asChild variant="secondary" size="sm" className="font-medium">
              <Link href="/dashboard/agent">Back to my shipments</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
