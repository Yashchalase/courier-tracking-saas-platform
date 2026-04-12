"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type TrackShipmentFormProps = {
  /** Called with trimmed tracking id to produce the next route (e.g. `/track/...` or dashboard path). */
  buildTrackingUrl: (trackingId: string) => string;
  className?: string;
  formClassName?: string;
};

export function TrackShipmentForm({
  buildTrackingUrl,
  className,
  formClassName,
}: TrackShipmentFormProps) {
  const router = useRouter();
  const [id, setId] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = id.trim();
    if (!trimmed) {
      setError("Enter a tracking number to continue.");
      return;
    }
    setError(null);
    router.push(buildTrackingUrl(trimmed));
  }

  return (
    <div className={cn("w-full max-w-lg", className)}>
      <form
        id="track-form"
        onSubmit={handleSubmit}
        className={cn(
          "space-y-5 rounded-2xl border border-border/80 bg-card/80 p-6 shadow-sm backdrop-blur-sm dark:bg-card/60",
          formClassName
        )}
        noValidate
      >
        <div className="space-y-2">
          <Label htmlFor="tracking-id">Tracking number</Label>
          <Input
            id="tracking-id"
            name="trackingId"
            type="text"
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="e.g. TRK-ABC123"
            value={id}
            onChange={(e) => {
              setId(e.target.value);
              if (error) setError(null);
            }}
            className={cn(
              "h-11 font-mono text-base",
              error && "border-destructive focus-visible:ring-destructive"
            )}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "tracking-error" : undefined}
          />
          {error ? (
            <p id="tracking-error" className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </div>
        <Button type="submit" className="h-11 w-full rounded-xl text-sm font-semibold">
          View tracking
        </Button>
      </form>
    </div>
  );
}
