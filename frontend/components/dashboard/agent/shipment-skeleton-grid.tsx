"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function ShimmerBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-muted",
        className
      )}
    >
      <div
        className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/25 to-transparent dark:via-white/10"
        aria-hidden
      />
    </div>
  );
}

export function ShipmentSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card
          key={i}
          className="overflow-hidden rounded-2xl border-0 bg-card/80 shadow-sm"
        >
          <CardHeader className="space-y-3 pb-2">
            <div className="flex items-start justify-between gap-3">
              <ShimmerBlock className="h-5 w-36" />
              <ShimmerBlock className="h-6 w-24 rounded-full" />
            </div>
            <ShimmerBlock className="h-4 w-3/4 max-w-[200px]" />
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="space-y-2">
              <ShimmerBlock className="h-3 w-16" />
              <ShimmerBlock className="h-10 w-full" />
              <ShimmerBlock className="h-10 w-full" />
            </div>
            <ShimmerBlock className="h-3 w-28" />
            <div className="grid grid-cols-2 gap-2">
              <ShimmerBlock className="h-10 w-full rounded-xl" />
              <ShimmerBlock className="h-10 w-full rounded-xl" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
