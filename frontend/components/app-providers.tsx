"use client";

import type { ReactNode } from "react";
import { Toaster } from "sonner";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        richColors
        closeButton
        position="top-center"
        toastOptions={{
          classNames: {
            toast:
              "rounded-xl border-border/80 bg-card text-card-foreground shadow-lg shadow-slate-900/10 dark:shadow-black/30",
          },
        }}
      />
    </>
  );
}
