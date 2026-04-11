"use client";

import dynamic from "next/dynamic";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import api from "@/lib/axios";

const AgentsLiveMap = dynamic(
  () => import("@/components/dashboard/company/agents-live-map"),
  { ssr: false, loading: () => <MapSkeleton /> }
);

function MapSkeleton() {
  return (
    <div className="flex h-[min(70vh,560px)] w-full items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/30 text-sm text-muted-foreground">
      Loading map…
    </div>
  );
}

type AgentRow = {
  id: string;
  currentLat: number | null;
  currentLng: number | null;
  user: { name?: string | null; email: string };
  hub: { name: string; city: string };
};

type HubRow = {
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
};

export default function CompanyLiveMapPage() {
  const [agents, setAgents] = React.useState<AgentRow[]>([]);
  const [hubs, setHubs] = React.useState<HubRow[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setError(null);
    try {
      const [aRes, hRes] = await Promise.all([
        api.get<{ agents: AgentRow[] }>("/api/agents"),
        api.get<{ hubs: HubRow[] }>("/api/hubs"),
      ]);
      setAgents(aRes.data.agents ?? []);
      setHubs(hRes.data.hubs ?? []);
    } catch {
      setError("We couldn't load the map. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  React.useEffect(() => {
    const t = setInterval(() => {
      void load();
    }, 8_000);
    return () => clearInterval(t);
  }, [load]);

  const located = agents.filter(
    (a) =>
      a.currentLat != null &&
      a.currentLng != null &&
      !Number.isNaN(a.currentLat) &&
      !Number.isNaN(a.currentLng)
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Live map</h1>
          <p className="text-muted-foreground">
            Gray circles are hubs; blue circles are drivers who are sharing their
            location. The map updates every few seconds while you keep this page
            open.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void load()}
          disabled={loading}
        >
          Refresh now
        </Button>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Fleet overview</CardTitle>
          <CardDescription>
            {loading
              ? "Loading…"
              : `${located} of ${agents.length} drivers are sharing their location right now.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-2 sm:p-4">
          <AgentsLiveMap agents={agents} hubs={hubs} />
        </CardContent>
      </Card>
    </div>
  );
}
