"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Package2, Eye, EyeOff, Loader2 } from "lucide-react";

import api from "@/lib/axios";
import { getDashboardHomeForRole } from "@/lib/role-routing";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FieldErrors = Partial<Record<"email" | "password" | "tenantSlug", string>>;

function signInErrorForUser(apiMessage: string | undefined): string {
  const fallback =
    "We couldn't sign you in. Check your email, password, and organization code.";
  if (!apiMessage || typeof apiMessage !== "string") return fallback;
  const low = apiMessage.toLowerCase();
  if (
    low.includes("internal") ||
    low.includes("server error") ||
    low.includes("500") ||
    low.includes("econn")
  ) {
    return "Something went wrong on our side. Please try again in a moment.";
  }
  if (
    low.includes("invalid") ||
    low.includes("unauthorized") ||
    low.includes("wrong password") ||
    low.includes("incorrect")
  ) {
    return "That email, password, or organization code doesn't match our records.";
  }
  if (low.includes("tenant") || low.includes("organization")) {
    if (low.includes("not found") || low.includes("unknown") || low.includes("invalid")) {
      return "We couldn't find that organization. Check the code your admin gave you.";
    }
  }
  if (apiMessage.length < 160) return apiMessage;
  return fallback;
}

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const fromSetup = searchParams.get("setup") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenantSlug, setTenantSlug] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  /** Whether first-time platform setup is still available (hide link when already done). */
  const [setupOffer, setSetupOffer] = useState<"loading" | "open" | "closed">(
    "loading"
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const { data } = await api.get<{ needsSetup: boolean }>(
          "/api/setup/status"
        );
        if (!cancelled) {
          setSetupOffer(data.needsSetup ? "open" : "closed");
        }
      } catch {
        // If the API is unreachable, keep the link so new installs can still try /setup.
        if (!cancelled) setSetupOffer("open");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function validate(): boolean {
    const errs: FieldErrors = {};
    if (!email) errs.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "Enter a valid email address.";
    if (!password) errs.password = "Password is required.";
    if (!tenantSlug) errs.tenantSlug = "Your organization code is required.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/login", {
        email,
        password,
        tenantSlug,
      });
      const { token, user } = data.data;
      login(token, user);
      router.push(getDashboardHomeForRole(user?.role));
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: { message?: string; data?: { errors?: { msg: string }[] } } };
      };
      const res = axiosErr?.response?.data;
      if (res?.data?.errors?.length) {
        const mapped: FieldErrors = {};
        res.data.errors.forEach((e) => {
          const msg = e.msg.toLowerCase();
          if (msg.includes("email")) mapped.email = e.msg;
          else if (msg.includes("password")) mapped.password = e.msg;
          else if (msg.includes("tenant")) mapped.tenantSlug = e.msg;
        });
        setFieldErrors(mapped);
      } else {
        setServerError(signInErrorForUser(res?.message));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-sky-950 via-slate-900 to-teal-950 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full border border-white/5" />
          <div className="absolute w-[450px] h-[450px] rounded-full border border-white/5" />
          <div className="absolute w-[300px] h-[300px] rounded-full border border-white/5" />
        </div>

        <div className="relative z-10 max-w-md text-center space-y-6">
          <Link
            href="/"
            className="group inline-flex flex-col items-center gap-2 rounded-2xl outline-none transition-opacity hover:opacity-95 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            aria-label="Courier Tracking — back to home"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 group-hover:border-white/30 transition-colors">
              <Package2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight">
              Courier Tracking
            </h1>
          </Link>
          <p className="text-slate-400 text-lg leading-relaxed">
            Real-time shipment visibility for your entire logistics operation —
            from dispatch to doorstep.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { label: "Shipments", value: "10K+" },
              { label: "Tenants", value: "200+" },
              { label: "Uptime", value: "99.9%" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl bg-white/5 border border-white/10 p-4"
              >
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
              Back to home
            </Link>
            <Link
              href="/"
              className="flex lg:hidden items-center gap-2 outline-none rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 w-fit"
              aria-label="Courier Tracking — back to home"
            >
              <Package2 className="w-6 h-6" />
              <span className="font-bold text-lg">Courier Tracking</span>
            </Link>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground">
              Sign in to your organization&apos;s account
            </p>
          </div>

          {fromSetup && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-200">
              Setup complete. Sign in as platform admin using organization code{" "}
              <span className="font-mono font-medium">platform</span>.
            </div>
          )}

          {serverError && (
            <div className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <span className="mt-0.5 shrink-0">⚠</span>
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="tenantSlug">Organization code</Label>
              <Input
                id="tenantSlug"
                type="text"
                autoComplete="organization"
                placeholder="e.g. acme-logistics"
                value={tenantSlug}
                onChange={(e) => {
                  setTenantSlug(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, tenantSlug: undefined }));
                }}
                className={cn(fieldErrors.tenantSlug && "border-destructive focus-visible:ring-destructive")}
              />
              {fieldErrors.tenantSlug && (
                <p className="text-xs text-destructive">{fieldErrors.tenantSlug}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }}
                className={cn(fieldErrors.email && "border-destructive focus-visible:ring-destructive")}
              />
              {fieldErrors.email && (
                <p className="text-xs text-destructive">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  className={cn(
                    "pr-10",
                    fieldErrors.password && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-destructive">{fieldErrors.password}</p>
              )}
            </div>

            <Button
              id="login-submit"
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Register
            </Link>
            {setupOffer === "loading" ? (
              <>
                {" · "}
                <span className="text-muted-foreground/80">Checking…</span>
              </>
            ) : setupOffer === "open" ? (
              <>
                {" · "}
                <Link
                  href="/setup"
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  Platform setup
                </Link>
              </>
            ) : (
              <>
                {" · "}
                <span
                  className="text-muted-foreground/90"
                  title="The platform super admin already exists. Use Sign in above."
                >
                  Platform already configured
                </span>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
          Loading…
        </div>
      }
    >
      <LoginPageInner />
    </Suspense>
  );
}
