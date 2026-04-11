"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getApiErrorMessage } from "@/lib/api-error";
import api from "@/lib/axios";

type SummaryData = {
  totalShipments: number;
  delivered: number;
  failed: number;
  inTransit: number;
  pending: number;
};

export default function CompanyMainDashboardPage() {
  const [summary, setSummary] = React.useState<SummaryData | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get<{
          data?: SummaryData;
          message?: string;
        }>("/api/analytics/summary");
        const payload = data.data;
        if (!payload) {
          throw new Error(data.message || "No summary data");
        }
        if (!cancelled) setSummary(payload);
      } catch (e: unknown) {
        if (!cancelled) {
          setError(
            getApiErrorMessage(
              e,
              "We couldn't load your dashboard summary. Try again."
            )
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const chartData = React.useMemo(() => {
    if (!summary) return [];
    return [
      { name: "Total", value: summary.totalShipments },
      { name: "Delivered", value: summary.delivered },
      { name: "Pending", value: summary.pending },
      { name: "Failed", value: summary.failed },
    ];
  }, [summary]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">
          Shipment counts for your organization.
        </p>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total shipments</CardDescription>
            <CardTitle className="text-3xl tabular-nums">
              {loading ? "—" : (summary?.totalShipments ?? 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Delivered</CardDescription>
            <CardTitle className="text-3xl tabular-nums text-emerald-700 dark:text-emerald-400">
              {loading ? "—" : (summary?.delivered ?? 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-3xl tabular-nums text-amber-700 dark:text-amber-400">
              {loading ? "—" : (summary?.pending ?? 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Failed</CardDescription>
            <CardTitle className="text-3xl tabular-nums text-red-700 dark:text-red-400">
              {loading ? "—" : (summary?.failed ?? 0)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>Volume by category</CardTitle>
          <CardDescription>
            Total, delivered, pending, and failed shipments
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          {loading ? (
            <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
              Loading chart…
            </div>
          ) : chartData.length ? (
            <div className="h-[280px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280}>
                <BarChart data={chartData} margin={{ left: 0, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    className="text-xs"
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    className="text-xs"
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--background))",
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="hsl(var(--primary))"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={56}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No data to display.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
