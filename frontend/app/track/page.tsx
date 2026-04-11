"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const headerAccountLinkClass =
  "rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export default function TrackPage() {
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
    router.push(`/track/${encodeURIComponent(trimmed)}`);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <a
        href="#track-form"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-lg"
      >
        Skip to tracking form
      </a>

      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-foreground transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
          >
            Courier Tracking
          </Link>
          <nav aria-label="Account">
            <Link href="/login" className={headerAccountLinkClass}>
              Log in
            </Link>
          </nav>
        </div>
      </header>

      <main
        id="main-content"
        className="relative flex flex-1 flex-col justify-center overflow-hidden border-b border-border/40 bg-gradient-to-br from-slate-50 via-white to-sky-50/90 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)_/_0.08),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)_/_0.12),transparent)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute right-0 top-1/2 h-[min(70vw,28rem)] w-[min(70vw,28rem)] -translate-y-1/2 translate-x-1/3 rounded-full bg-sky-200/25 blur-3xl dark:bg-sky-900/20"
          aria-hidden
        />

        <div className="relative mx-auto w-full max-w-lg px-4 py-16 sm:px-6 sm:py-20">
          <div className="text-center space-y-2 mb-8">
            <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Track a shipment
            </h1>
            <p className="text-pretty text-muted-foreground text-base leading-relaxed sm:text-lg">
              Enter your tracking number to see live status and delivery updates.
            </p>
          </div>

          <form
            id="track-form"
            onSubmit={handleSubmit}
            className="rounded-2xl border border-border/80 bg-card/80 p-6 shadow-sm backdrop-blur-sm dark:bg-card/60 space-y-5"
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
                  "font-mono text-base h-11",
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
            <Button type="submit" className="w-full h-11 rounded-xl text-sm font-semibold">
              View tracking
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            <Link
              href="/"
              className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
            >
              Back to home
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
