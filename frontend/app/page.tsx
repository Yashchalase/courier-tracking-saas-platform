import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const headerAccountLinkClass =
  "rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-sky-50 hover:text-sky-800 dark:hover:bg-sky-950/50 dark:hover:text-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2";

const heroButtonClass =
  "min-h-11 min-w-[10.5rem] rounded-xl px-6 text-sm font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-sm";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-sky-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:shadow-lg"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-50 border-b border-sky-100/80 bg-white/85 backdrop-blur-md supports-[backdrop-filter]:bg-white/75 dark:border-sky-900/40 dark:bg-slate-950/85 dark:supports-[backdrop-filter]:bg-slate-950/75">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight bg-gradient-to-r from-sky-700 to-teal-700 bg-clip-text text-transparent dark:from-sky-400 dark:to-teal-400 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 rounded-md"
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

      <main id="main-content" className="flex flex-1 flex-col">
        <section
          className="relative flex flex-1 flex-col justify-center overflow-hidden border-b border-sky-100/60 bg-gradient-to-br from-sky-100/90 via-cyan-50/50 to-teal-100/80 dark:border-sky-900/30 dark:from-slate-950 dark:via-sky-950/35 dark:to-teal-950/25"
          aria-labelledby="hero-heading"
        >
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-15%,rgb(14_165_233_/_0.12),transparent)] dark:bg-[radial-gradient(ellipse_85%_55%_at_50%_-15%,rgb(56_189_248_/_0.14),transparent)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute right-0 top-1/2 h-[min(70vw,28rem)] w-[min(70vw,28rem)] -translate-y-1/2 translate-x-1/3 rounded-full bg-sky-400/35 blur-3xl dark:bg-sky-500/20"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute bottom-0 left-0 h-[min(60vw,22rem)] w-[min(60vw,22rem)] -translate-x-1/4 translate-y-1/4 rounded-full bg-teal-300/40 blur-3xl dark:bg-teal-600/15"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute left-1/2 top-1/3 h-[min(50vw,18rem)] w-[min(50vw,18rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-200/30 blur-3xl dark:bg-cyan-500/10"
            aria-hidden
          />

          <div className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
            <div className="mx-auto max-w-2xl text-center lg:max-w-3xl">
              <h1
                id="hero-heading"
                className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl lg:leading-[1.08] bg-gradient-to-br from-sky-800 via-teal-800 to-cyan-900 bg-clip-text text-transparent dark:from-sky-300 dark:via-teal-300 dark:to-cyan-200"
              >
                Courier Tracking
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-sky-950/70 dark:text-sky-100/75 sm:mt-6 sm:text-lg sm:leading-relaxed">
                Track your shipments in real time with ease and reliability.
              </p>

              <div
                className="mt-10 flex flex-col items-stretch gap-3 sm:mt-12 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4"
                role="group"
                aria-label="Get started"
              >
                <Button
                  asChild
                  size="lg"
                  className={cn(
                    heroButtonClass,
                    "border-0 bg-gradient-to-r from-sky-600 to-teal-600 text-white shadow-md shadow-sky-600/25 hover:from-sky-500 hover:to-teal-500 hover:shadow-lg hover:shadow-sky-600/30 dark:from-sky-500 dark:to-teal-500 dark:shadow-sky-900/40 dark:hover:from-sky-400 dark:hover:to-teal-400 focus-visible:ring-sky-500"
                  )}
                >
                  <Link href="/track">Track Shipment</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className={cn(
                    heroButtonClass,
                    "border-2 border-sky-200/90 bg-white/90 text-sky-950 backdrop-blur-sm hover:border-sky-300 hover:bg-sky-50 dark:border-sky-600/50 dark:bg-slate-950/60 dark:text-sky-50 dark:hover:border-sky-500 dark:hover:bg-sky-950/50 focus-visible:ring-sky-400"
                  )}
                >
                  <Link href="/login">Log in</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className={cn(
                    heroButtonClass,
                    "border-2 border-teal-200/90 bg-white/90 text-teal-950 backdrop-blur-sm hover:border-teal-300 hover:bg-teal-50 dark:border-teal-600/45 dark:bg-slate-950/60 dark:text-teal-50 dark:hover:border-teal-500 dark:hover:bg-teal-950/40 focus-visible:ring-teal-400"
                  )}
                >
                  <Link href="/register">Register</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-sky-100/70 bg-gradient-to-r from-sky-50/80 via-teal-50/40 to-cyan-50/60 dark:border-sky-900/40 dark:from-slate-950 dark:via-sky-950/20 dark:to-teal-950/20">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-sky-900/55 dark:text-sky-200/60 sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Courier Tracking. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
