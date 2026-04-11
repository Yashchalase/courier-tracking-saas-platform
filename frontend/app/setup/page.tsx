"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Package2, Eye, EyeOff } from "lucide-react";

import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

function setupSubmitErrorForUser(raw: string | undefined): string {
  const fallback =
    "We couldn't finish setup. Check your email and password (8+ characters) and try again.";
  if (!raw || typeof raw !== "string") return fallback;
  const low = raw.toLowerCase();
  if (low.includes("internal") || low.includes("500") || low.includes("econn")) {
    return "Something went wrong on our side. Please try again in a moment.";
  }
  if (raw.length < 200) return raw;
  return fallback;
}

export default function SetupPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [needsSetup, setNeedsSetup] = useState<boolean | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setChecking(true);
      try {
        const { data } = await api.get<{ needsSetup: boolean }>("/api/setup/status");
        if (!cancelled) {
          setNeedsSetup(data.needsSetup);
          if (!data.needsSetup) {
            router.replace("/login");
          }
        }
      } catch {
        if (!cancelled) {
          setNeedsSetup(true);
          setServerError(
            "We couldn't reach the app right now. Check your internet connection, or ask your host if the service is running."
          );
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    if (!email || !password || password.length < 8) {
      setServerError("Email and password (min 8 characters) are required.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/api/setup", {
        name: name.trim() || undefined,
        email,
        password,
      });
      router.replace("/login?setup=1");
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { error?: string } } };
      setServerError(
        setupSubmitErrorForUser(ax.response?.data?.error)
      );
    } finally {
      setLoading(false);
    }
  }

  if (checking || needsSetup === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-sky-950 via-slate-900 to-teal-950 flex-col items-center justify-center p-12">
        <div className="max-w-md text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 border border-white/20 mb-2">
            <Package2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">First-time setup</h1>
          <p className="text-slate-400 leading-relaxed">
            Create the main platform administrator. This screen only appears before that account
            exists. Afterward, sign in using organization code{" "}
            <span className="text-white font-mono">platform</span>.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="flex lg:hidden items-center gap-2 mb-2">
            <Package2 className="w-6 h-6" />
            <span className="font-bold text-lg">Setup</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Create super admin</h2>
            <p className="text-muted-foreground text-sm">
              You only complete this once. Next, you&apos;ll go to the sign-in page.
            </p>
          </div>

          {serverError && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="setup-name">Name</Label>
              <Input
                id="setup-name"
                autoComplete="name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="setup-email">Email</Label>
              <Input
                id="setup-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="setup-password">Password</Label>
              <div className="relative">
                <Input
                  id="setup-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className="pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className={cn("w-full")} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Creating…" : "Complete setup"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already configured?{" "}
            <Link href="/login" className="font-medium underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
