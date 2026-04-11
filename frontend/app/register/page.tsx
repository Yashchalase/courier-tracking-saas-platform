"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Package2, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";

import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FieldErrors = Partial<Record<"email" | "password" | "tenantSlug", string>>;

function registerErrorForUser(apiMessage: string | undefined): string {
  const fallback =
    "We couldn't create your account. Check your details and try again.";
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
  if (low.includes("already") || low.includes("exists") || low.includes("taken")) {
    return "An account with this email may already exist. Try signing in instead.";
  }
  if (low.includes("tenant") || low.includes("organization")) {
    if (low.includes("not found") || low.includes("unknown") || low.includes("invalid")) {
      return "We couldn't find that organization code. Ask your admin for the right one.";
    }
  }
  if (apiMessage.length < 160) return apiMessage;
  return fallback;
}

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenantSlug, setTenantSlug] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [success, setSuccess] = useState(false);

  function validate(): boolean {
    const errs: FieldErrors = {};
    if (!email) errs.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "Enter a valid email address.";
    if (!password) errs.password = "Password is required.";
    else if (password.length < 8)
      errs.password = "Password must be at least 8 characters.";
    else if (password.length > 128)
      errs.password = "Password must be no more than 128 characters.";
    if (!tenantSlug) errs.tenantSlug = "Your organization code is required.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // Password strength indicator helpers
  const passwordStrength = (() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score; // 0-5
  })();

  const strengthLabel =
    passwordStrength <= 1
      ? { label: "Weak", color: "bg-destructive" }
      : passwordStrength <= 3
      ? { label: "Fair", color: "bg-yellow-500" }
      : { label: "Strong", color: "bg-green-500" };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      await api.post("/api/auth/register", { email, password, tenantSlug });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: { message?: string; data?: { errors?: { msg: string; path?: string }[] } } };
      };
      const res = axiosErr?.response?.data;
      if (res?.data?.errors?.length) {
        const mapped: FieldErrors = {};
        res.data.errors.forEach((e) => {
          if (e.path === "email" || e.msg.toLowerCase().includes("email"))
            mapped.email = e.msg;
          else if (e.path === "password" || e.msg.toLowerCase().includes("password"))
            mapped.password = e.msg;
          else if (e.path === "tenantSlug" || e.msg.toLowerCase().includes("tenant"))
            mapped.tenantSlug = e.msg;
        });
        setFieldErrors(mapped);
      } else {
        setServerError(registerErrorForUser(res?.message));
      }
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-sm w-full text-center space-y-4 animate-in fade-in zoom-in duration-500">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 mb-2">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold">Account created!</h2>
          <p className="text-muted-foreground">
            Redirecting you to login…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-sky-950 via-slate-900 to-teal-950 flex-col items-center justify-center p-12 relative overflow-hidden">
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
              Join Courier Tracking
            </h1>
          </Link>
          <p className="text-slate-400 text-lg leading-relaxed">
            Create your customer account in seconds and start tracking your
            shipments in real time.
          </p>
          <ul className="space-y-3 text-left mt-4">
            {[
              "Live parcel tracking on a public link",
              "Instant status notifications",
              "Full delivery history at a glance",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-slate-300 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
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
            <h2 className="text-3xl font-bold tracking-tight">Create an account</h2>
            <p className="text-muted-foreground">
              Register as a customer under your organization
            </p>
          </div>

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
                className={cn(
                  fieldErrors.tenantSlug && "border-destructive focus-visible:ring-destructive"
                )}
              />
              <p className="text-xs text-muted-foreground">
                Ask your logistics provider for your organization code.
              </p>
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
                className={cn(
                  fieldErrors.email && "border-destructive focus-visible:ring-destructive"
                )}
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
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
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

              {/* Strength meter */}
              {password && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-1 flex-1 rounded-full transition-all duration-300",
                          i <= passwordStrength
                            ? strengthLabel.color
                            : "bg-muted"
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Strength:{" "}
                    <span
                      className={cn(
                        "font-medium",
                        passwordStrength <= 1
                          ? "text-destructive"
                          : passwordStrength <= 3
                          ? "text-yellow-500"
                          : "text-green-500"
                      )}
                    >
                      {strengthLabel.label}
                    </span>
                  </p>
                </div>
              )}
              {fieldErrors.password && (
                <p className="text-xs text-destructive">{fieldErrors.password}</p>
              )}
            </div>

            <Button
              id="register-submit"
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
