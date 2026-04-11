"use client";

import { Camera, ImagePlus, Loader2 } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AgentShipment } from "@/lib/agent-shipment-utils";
import { cn } from "@/lib/utils";

const PROOF_NOTE = "Proof uploaded";

type UploadProofDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shipment: AgentShipment | null;
  submitting?: boolean;
  onSubmit: (file: File) => Promise<void>;
};

export function UploadProofDialog({
  open,
  onOpenChange,
  shipment,
  submitting,
  onSubmit,
}: UploadProofDialogProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      setFile(null);
      setPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    }
  }, [open]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    try {
      await onSubmit(file);
    } catch {
      /* errors surfaced by parent (toast) */
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "fixed bottom-0 left-0 right-0 top-auto z-50 flex max-h-[min(90vh,680px)] w-full max-w-none translate-y-0 flex-col gap-0 overflow-hidden rounded-t-2xl border border-border/80 bg-background p-0 shadow-2xl duration-300",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-bottom-4 data-[state=open]:slide-in-from-bottom-8",
          "sm:bottom-auto sm:left-1/2 sm:right-auto sm:top-1/2 sm:max-h-[85vh] sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:data-[state=open]:slide-in-from-bottom-0 sm:data-[state=open]:zoom-in-95 sm:data-[state=closed]:slide-out-to-bottom-0 sm:data-[state=closed]:zoom-out-95"
        )}
      >
        <div className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-muted-foreground/25 sm:hidden" />

        <form
          onSubmit={(ev) => void handleSubmit(ev)}
          className="max-h-[inherit] overflow-y-auto p-6 pb-8 sm:pb-6"
        >
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="text-xl font-semibold tracking-tight">
              Upload proof
            </DialogTitle>
            <DialogDescription className="text-base leading-relaxed">
              {shipment ? (
                <>
                  Add a photo for{" "}
                  <span className="font-mono font-medium text-foreground">
                    {shipment.trackingId}
                  </span>
                  . Images only, up to 5MB.
                </>
              ) : (
                "Attach a delivery photo."
              )}
            </DialogDescription>
          </DialogHeader>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFileChange}
          />

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={submitting}
            className={cn(
              "mt-6 flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border/80 bg-muted/30 px-6 py-10 transition-colors",
              "hover:border-primary/40 hover:bg-muted/50",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              submitting && "pointer-events-none opacity-60"
            )}
          >
            {preview ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={preview}
                alt="Selected proof preview"
                className="max-h-48 w-full rounded-xl object-contain"
              />
            ) : (
              <>
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ImagePlus className="h-7 w-7" aria-hidden />
                </span>
                <span className="text-sm font-medium text-foreground">
                  Tap to choose an image
                </span>
                <span className="text-xs text-muted-foreground">
                  JPEG, PNG, or WebP
                </span>
              </>
            )}
          </button>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl"
              disabled={submitting}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-11 gap-2 rounded-xl"
              disabled={!file || submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Uploading…
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4" aria-hidden />
                  Upload proof
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { PROOF_NOTE };
