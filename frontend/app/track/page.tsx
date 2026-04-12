"use client";

import Link from "next/link";

import { TrackShipmentForm } from "@/components/track/track-shipment-form";

const headerAccountLinkClass =
  "rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export default function TrackPage() {
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
          <div className="mb-8 space-y-2 text-center">
            <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Track a shipment
            </h1>
            <p className="text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              Enter your tracking number to see live status and delivery updates.
            </p>
          </div>

          <TrackShipmentForm
            buildTrackingUrl={(id) => `/track/${encodeURIComponent(id)}`}
            className="mx-auto"
          />

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
