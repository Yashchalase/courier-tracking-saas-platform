import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Offline | Courier Tracking",
  description: "You appear to be offline.",
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <div className="max-w-md space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">You&apos;re offline</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          This page opened from your saved copy of the app. Check your Wi‑Fi or
          mobile data, then try again.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  );
}
