import Link from "next/link";
import {
  Brain,
  Building2,
  Check,
  Mail,
  MapPin,
  Package,
  QrCode,
  Route,
  Shield,
  Truck,
  UserCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const headerAccountLinkClass =
  "rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-sky-50 hover:text-sky-800 dark:hover:bg-sky-950/50 dark:hover:text-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2";

const heroButtonClass =
  "min-h-11 min-w-[10.5rem] rounded-xl px-6 text-sm font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-sm";

const featureCards = [
  {
    icon: MapPin,
    title: "Real-time GPS Tracking",
    description: "Live location updates on every delivery so teams and customers always know where parcels are.",
  },
  {
    icon: Building2,
    title: "Multi-tenant Platform",
    description: "Isolated workspaces per company with branding, users, and data kept separate and secure.",
  },
  {
    icon: Mail,
    title: "Email Notifications",
    description: "Automated alerts for status changes, delays, and proof of delivery to the right people.",
  },
  {
    icon: QrCode,
    title: "QR Code Scanning",
    description: "Fast handoffs and verification at hubs and doorsteps with scannable shipment identifiers.",
  },
  {
    icon: Route,
    title: "Route Optimization",
    description: "Smarter sequencing and dispatch suggestions to cut drive time and meet delivery windows.",
  },
  {
    icon: Brain,
    title: "AI Delivery Prediction",
    description: "Estimated arrival windows and risk signals powered by historical patterns and live conditions.",
  },
] as const;

const howItWorksSteps = [
  "Company registers and creates account",
  "Create shipments and assign agents",
  "Agent updates delivery status in real time",
  "Customer tracks shipment with tracking ID",
] as const;

const roleCards = [
  {
    name: "Super Admin",
    icon: Shield,
    features: ["Platform-wide oversight", "Tenant & billing controls", "Security & compliance settings"],
  },
  {
    name: "Company Admin",
    icon: Building2,
    features: ["Manage teams & shipments", "Configure workflows", "Reports & performance metrics"],
  },
  {
    name: "Delivery Agent",
    icon: Truck,
    features: ["Mobile-friendly updates", "Scan & confirm deliveries", "Optimized route visibility"],
  },
  {
    name: "Customer",
    icon: UserCircle,
    features: ["Public tracking by ID", "Clear status timeline", "Notifications on milestones"],
  },
] as const;

const heroStats = [
  { label: "10K+", sub: "Shipments" },
  { label: "500+", sub: "Companies" },
  { label: "99.9%", sub: "Uptime" },
] as const;

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-sky-100/80 via-cyan-50/50 to-teal-50/70 dark:from-slate-950 dark:via-sky-950/30 dark:to-teal-950/25">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-sky-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:shadow-lg"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-50 border-b border-sky-200/50 bg-sky-50/80 backdrop-blur-md supports-[backdrop-filter]:bg-sky-50/70 dark:border-sky-900/40 dark:bg-slate-950/85 dark:supports-[backdrop-filter]:bg-slate-950/75">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="rounded-md text-lg font-semibold tracking-tight bg-gradient-to-r from-sky-700 to-teal-700 bg-clip-text text-transparent transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 dark:from-sky-400 dark:to-teal-400"
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
          className="relative flex min-h-[85vh] flex-col justify-center overflow-hidden bg-gradient-to-br from-sky-200/90 via-cyan-100/70 to-teal-200/85 dark:from-slate-950 dark:via-sky-950/40 dark:to-teal-950/30"
          aria-labelledby="hero-heading"
        >
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_60%_at_50%_-10%,rgb(14_165_233_/_0.25),transparent_55%)] dark:bg-[radial-gradient(ellipse_100%_60%_at_50%_-10%,rgb(56_189_248_/_0.2),transparent_55%)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_100%_50%,rgb(20_184_166_/_0.2),transparent_50%)] dark:bg-[radial-gradient(ellipse_80%_50%_at_100%_50%,rgb(45_212_191_/_0.12),transparent_50%)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute right-0 top-1/2 h-[min(70vw,28rem)] w-[min(70vw,28rem)] -translate-y-1/2 translate-x-1/3 rounded-full bg-sky-400/40 blur-3xl dark:bg-sky-500/25"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute bottom-0 left-0 h-[min(60vw,22rem)] w-[min(60vw,22rem)] -translate-x-1/4 translate-y-1/4 rounded-full bg-teal-300/45 blur-3xl dark:bg-teal-600/20"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute left-1/2 top-1/3 h-[min(50vw,18rem)] w-[min(50vw,18rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-200/35 blur-3xl dark:bg-cyan-500/15"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-sky-50 via-sky-100/70 to-transparent dark:from-slate-950 dark:via-sky-950/50 dark:to-transparent"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-[radial-gradient(ellipse_120%_100%_at_50%_100%,rgb(255_255_255_/_0.55),transparent_65%)] dark:bg-[radial-gradient(ellipse_120%_100%_at_50%_100%,rgb(15_23_42_/_0.5),transparent_65%)]"
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
              <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-sky-950/75 dark:text-sky-100/80 sm:mt-6 sm:text-lg sm:leading-relaxed">
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

              <div
                className="mt-14 grid grid-cols-1 gap-6 sm:mt-16 sm:grid-cols-3 sm:gap-8"
                aria-label="Platform statistics"
              >
                {heroStats.map((stat, i) => (
                  <div
                    key={stat.sub}
                    className={cn(
                      "rounded-2xl border border-sky-200/60 bg-white/50 px-6 py-5 shadow-sm backdrop-blur-sm transition-all duration-500 dark:border-sky-800/50 dark:bg-slate-950/40",
                      "animate-in fade-in slide-in-from-bottom-4 fill-mode-both",
                      i === 0 && "delay-100",
                      i === 1 && "delay-200",
                      i === 2 && "delay-300"
                    )}
                  >
                    <p className="bg-gradient-to-r from-sky-700 to-teal-700 bg-clip-text text-3xl font-bold tabular-nums tracking-tight text-transparent dark:from-sky-400 dark:to-teal-400 sm:text-4xl">
                      {stat.label}
                    </p>
                    <p className="mt-1 text-sm font-medium text-sky-900/65 dark:text-sky-200/70">{stat.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          className="relative border-b border-sky-200/35 bg-gradient-to-b from-sky-50/90 via-cyan-50/40 to-teal-50/50 py-20 dark:border-sky-800/50 dark:from-sky-950/60 dark:via-slate-950 dark:to-slate-950 sm:py-24"
          aria-labelledby="features-heading"
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-teal-100/30 to-transparent dark:from-teal-900/20 dark:to-transparent"
            aria-hidden
          />
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2
              id="features-heading"
              className="mx-auto max-w-2xl text-center text-3xl font-bold tracking-tight text-sky-950 dark:text-sky-50 sm:text-4xl"
            >
              Everything you need to manage deliveries
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-base text-sky-900/65 dark:text-sky-200/65">
              One platform for visibility, coordination, and a better delivery experience end to end.
            </p>
            <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featureCards.map(({ icon: Icon, title, description }) => (
                <li key={title}>
                  <div className="group h-full rounded-2xl border border-sky-200/50 bg-white/80 p-6 shadow-sm shadow-sky-100/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-sky-300/70 hover:bg-white hover:shadow-lg hover:shadow-sky-200/40 dark:border-sky-800/60 dark:bg-slate-900/50 dark:hover:border-sky-600 dark:hover:shadow-sky-950/50">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/15 to-teal-500/15 text-sky-700 transition-colors group-hover:from-sky-500/25 group-hover:to-teal-500/25 dark:text-sky-400">
                      <Icon className="h-6 w-6" aria-hidden />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-sky-950 dark:text-sky-50">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-sky-900/65 dark:text-sky-200/65">
                      {description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          className="border-b border-sky-200/35 bg-gradient-to-b from-teal-50/40 via-sky-50/50 to-cyan-50/35 py-20 dark:border-sky-800/45 dark:from-slate-950 dark:via-sky-950/15 dark:to-slate-950 sm:py-24"
          aria-labelledby="how-heading"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2
              id="how-heading"
              className="text-center text-3xl font-bold tracking-tight text-sky-950 dark:text-sky-50 sm:text-4xl"
            >
              How it works
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-base text-sky-900/65 dark:text-sky-200/65">
              From signup to proof of delivery in four straightforward steps.
            </p>
            <ol className="mt-16 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-sky-200/80 dark:lg:divide-sky-700/60">
              {howItWorksSteps.map((text, index) => (
                <li key={text} className="flex flex-col items-center px-0 text-center lg:px-6">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-600 to-teal-600 text-lg font-bold text-white shadow-md shadow-sky-600/25 dark:shadow-sky-900/40">
                    {index + 1}
                  </span>
                  <p className="mt-4 text-sm font-medium leading-relaxed text-sky-900/80 dark:text-sky-100/80">
                    {text}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          className="border-b border-sky-200/35 bg-gradient-to-b from-cyan-50/45 via-sky-100/40 to-teal-50/45 py-20 dark:border-sky-800/45 dark:from-sky-950/30 dark:via-teal-950/20 dark:to-slate-950 sm:py-24"
          aria-labelledby="roles-heading"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2
              id="roles-heading"
              className="text-center text-3xl font-bold tracking-tight text-sky-950 dark:text-sky-50 sm:text-4xl"
            >
              Built for every stakeholder
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-base text-sky-900/65 dark:text-sky-200/65">
              Tailored tools for admins, agents, and customers—without compromising security or clarity.
            </p>
            <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {roleCards.map(({ name, icon: Icon, features }) => (
                <li key={name}>
                  <div className="flex h-full flex-col rounded-2xl border border-sky-200/50 bg-white/75 p-6 shadow-sm shadow-sky-100/40 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-300/60 hover:bg-white/90 hover:shadow-md dark:border-sky-800/60 dark:bg-slate-900/60">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300">
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>
                      <h3 className="text-lg font-semibold text-sky-950 dark:text-sky-50">{name}</h3>
                    </div>
                    <ul className="mt-5 flex flex-1 flex-col gap-2.5">
                      {features.map((f) => (
                        <li key={f} className="flex gap-2 text-sm text-sky-900/75 dark:text-sky-200/75">
                          <Check
                            className="mt-0.5 h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400"
                            aria-hidden
                          />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          className="relative overflow-hidden border-b border-sky-200/40 py-24 sm:py-28 dark:border-sky-800/50"
          aria-labelledby="cta-heading"
        >
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-200/85 via-cyan-100/65 to-teal-200/80 dark:from-slate-950 dark:via-sky-950/40 dark:to-teal-950/30"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_55%_at_50%_-15%,rgb(14_165_233_/_0.22),transparent_55%)] dark:bg-[radial-gradient(ellipse_100%_55%_at_50%_-15%,rgb(56_189_248_/_0.15),transparent_55%)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute right-0 top-1/2 h-[min(55vw,22rem)] w-[min(55vw,22rem)] -translate-y-1/2 translate-x-1/4 rounded-full bg-sky-400/35 blur-3xl dark:bg-sky-500/20"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute bottom-0 left-0 h-[min(45vw,18rem)] w-[min(45vw,18rem)] -translate-x-1/4 translate-y-1/3 rounded-full bg-teal-300/40 blur-3xl dark:bg-teal-600/15"
            aria-hidden
          />
          <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <Package
              className="mx-auto h-12 w-12 text-sky-700 drop-shadow-sm dark:text-sky-300"
              strokeWidth={1.5}
              aria-hidden
            />
            <h2
              id="cta-heading"
              className="mt-6 text-balance text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-br from-sky-800 via-teal-800 to-cyan-900 bg-clip-text text-transparent dark:from-sky-300 dark:via-teal-300 dark:to-cyan-200"
            >
              Ready to get started?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base text-sky-900/75 dark:text-sky-100/80">
              Create an account for your team or track a shipment instantly with a tracking ID.
            </p>
            <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Button
                asChild
                size="lg"
                className={cn(
                  heroButtonClass,
                  "min-w-[10.5rem] border-0 bg-gradient-to-r from-sky-600 to-teal-600 text-white shadow-md shadow-sky-600/25 hover:from-sky-500 hover:to-teal-500 hover:shadow-lg dark:from-sky-500 dark:to-teal-500 dark:hover:from-sky-400 dark:hover:to-teal-400"
                )}
              >
                <Link href="/register">Get Started</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className={cn(
                  heroButtonClass,
                  "min-w-[10.5rem] border-2 border-sky-200/90 bg-white/90 text-sky-950 backdrop-blur-sm hover:border-sky-300 hover:bg-white dark:border-sky-600/50 dark:bg-slate-950/50 dark:text-sky-50 dark:hover:border-sky-500"
                )}
              >
                <Link href="/track">Track a Shipment</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer
        className="relative border-t border-sky-200/50 bg-gradient-to-b from-teal-50/80 via-sky-100/70 to-cyan-50/60 dark:border-sky-800/50 dark:from-slate-950 dark:via-sky-950/35 dark:to-teal-950/25"
        aria-labelledby="footer-heading"
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_90%_80%_at_50%_0%,rgb(20_184_166_/_0.12),transparent_70%)] dark:bg-[radial-gradient(ellipse_90%_80%_at_50%_0%,rgb(45_212_191_/_0.08),transparent_70%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-300/50 to-transparent dark:via-teal-600/30"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <h2 id="footer-heading" className="sr-only">
            Site footer
          </h2>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2.5 rounded-md text-lg font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 text-white shadow-md shadow-sky-600/25 ring-1 ring-white/60 dark:ring-white/10">
                  <Package className="h-[1.15rem] w-[1.15rem]" aria-hidden />
                </span>
                <span className="bg-gradient-to-r from-sky-700 to-teal-700 bg-clip-text text-transparent dark:from-sky-400 dark:to-teal-400">
                  Courier Tracking
                </span>
              </Link>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-sky-900/70 dark:text-sky-200/70">
                Real-time visibility for teams, agents, and customers—built for reliable last-mile delivery.
              </p>
            </div>
            <nav className="lg:col-span-2" aria-label="Product">
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400/90">
                Product
              </p>
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <Link
                    href="/track"
                    className="text-sky-800/80 transition-colors hover:text-teal-700 dark:text-sky-300/85 dark:hover:text-teal-300"
                  >
                    Track shipment
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#features-heading"
                    className="text-sky-800/80 transition-colors hover:text-teal-700 dark:text-sky-300/85 dark:hover:text-teal-300"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#how-heading"
                    className="text-sky-800/80 transition-colors hover:text-teal-700 dark:text-sky-300/85 dark:hover:text-teal-300"
                  >
                    How it works
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#roles-heading"
                    className="text-sky-800/80 transition-colors hover:text-teal-700 dark:text-sky-300/85 dark:hover:text-teal-300"
                  >
                    Roles
                  </Link>
                </li>
              </ul>
            </nav>
            <nav className="lg:col-span-2" aria-label="Account">
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400/90">
                Account
              </p>
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <Link
                    href="/login"
                    className="text-sky-800/80 transition-colors hover:text-teal-700 dark:text-sky-300/85 dark:hover:text-teal-300"
                  >
                    Log in
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    className="text-sky-800/80 transition-colors hover:text-teal-700 dark:text-sky-300/85 dark:hover:text-teal-300"
                  >
                    Register
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#cta-heading"
                    className="text-sky-800/80 transition-colors hover:text-teal-700 dark:text-sky-300/85 dark:hover:text-teal-300"
                  >
                    Get started
                  </Link>
                </li>
              </ul>
            </nav>
            <div className="sm:col-span-2 lg:col-span-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400/90">
                Highlights
              </p>
              <ul className="mt-4 space-y-3.5 text-sm text-sky-800/75 dark:text-sky-300/80">
                <li className="flex gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" aria-hidden />
                  <span>Email notifications for milestones and delivery updates</span>
                </li>
                <li className="flex gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" aria-hidden />
                  <span>Live maps and GPS-backed tracking for your operations</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-sky-200/70 pt-8 text-center text-sm text-sky-800/60 dark:border-sky-800/60 dark:text-sky-400/75 sm:flex-row sm:text-left">
            <p>© {new Date().getFullYear()} Courier Tracking. All rights reserved.</p>
            <p className="text-sky-700/55 dark:text-sky-500/65">
              Built for teams who move packages, not paperwork.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
