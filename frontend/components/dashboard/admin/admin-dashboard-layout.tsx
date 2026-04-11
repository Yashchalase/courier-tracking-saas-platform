"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Crown, LogOut, Menu } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { logoutAndGoToLogin } from "@/lib/logout-client";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";

const ADMIN_NAV = [
  {
    href: "/dashboard/admin",
    label: "Admin",
    icon: Crown,
    match: (path: string) => path === "/dashboard/admin" || path === "/dashboard/admin/",
  },
] as const;

function NavLinks({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();
  return (
    <nav className={cn("flex flex-col gap-1", className)}>
      {ADMIN_NAV.map((item) => {
        const active = item.match(pathname);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAuthStore((s) => s.user);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  function handleLogout() {
    logoutAndGoToLogin();
  }

  const displayName =
    (user && typeof user.name === "string" && user.name) || user?.email || "User";

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-sky-50/60 via-background to-teal-50/50 dark:from-slate-950 dark:via-background dark:to-slate-950">
      <aside className="hidden w-60 shrink-0 border-r border-border/80 bg-card/95 shadow-sm shadow-sky-950/[0.04] backdrop-blur-sm dark:bg-card dark:shadow-none lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:flex-col">
        <div className="flex h-14 items-center gap-2 border-b border-border/80 px-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Crown className="h-4 w-4 shrink-0" aria-hidden />
          </span>
          <span className="text-sm font-semibold tracking-tight">Super admin</span>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <NavLinks />
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col lg:pl-60">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-border/80 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="flex items-center gap-2 lg:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 border-border/80 p-0">
                <SheetHeader className="flex flex-row items-center gap-2 border-b border-border/80 px-4 py-3 text-left">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Crown className="h-4 w-4 shrink-0" aria-hidden />
                  </span>
                  <SheetTitle className="text-base">Super admin</SheetTitle>
                </SheetHeader>
                <div className="p-3">
                  <NavLinks onNavigate={() => setMobileOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>
            <span className="font-semibold lg:hidden">Dashboard</span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden min-w-0 text-right text-sm sm:block">
              <p className="truncate font-medium leading-none">{displayName}</p>
              {user?.email ? (
                <p className="mt-1 truncate text-xs text-muted-foreground">{user.email}</p>
              ) : null}
            </div>
            <Separator orientation="vertical" className="hidden h-8 sm:block" />
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

