"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { getDashboardHomeForRole } from "@/lib/role-routing";
import { useAuthStore, type UserRole } from "@/store/auth";

type DashboardRoleGuardProps = {
  allowedRole: UserRole;
  children: React.ReactNode;
};

export function DashboardRoleGuard({
  allowedRole,
  children,
}: DashboardRoleGuardProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() =>
      setHydrated(true)
    );
    if (useAuthStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!token || !user) {
      router.replace("/login");
      return;
    }
    if (!user.role || user.role !== allowedRole) {
      router.replace(getDashboardHomeForRole(user.role));
    }
  }, [hydrated, token, user, allowedRole, router]);

  if (!hydrated) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50/60 via-background to-teal-50/50 dark:from-slate-950 dark:via-background dark:to-slate-950"
        role="status"
        aria-live="polite"
      >
        <Loader2
          className="h-8 w-8 animate-spin text-muted-foreground"
          aria-hidden
        />
        <span className="sr-only">Loading your session…</span>
      </div>
    );
  }

  if (!token || !user || user.role !== allowedRole) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50/60 via-background to-teal-50/50 dark:from-slate-950 dark:via-background dark:to-slate-950"
        role="status"
      >
        <Loader2
          className="h-8 w-8 animate-spin text-muted-foreground"
          aria-hidden
        />
        <span className="sr-only">Redirecting…</span>
      </div>
    );
  }

  return <>{children}</>;
}
