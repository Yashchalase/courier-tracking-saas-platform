"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import api from "@/lib/axios";

function parseLatitude(s: string): number | null {
  const n = Number.parseFloat(s.trim());
  if (Number.isNaN(n) || n < -90 || n > 90) return null;
  return n;
}

function parseLongitude(s: string): number | null {
  const n = Number.parseFloat(s.trim());
  if (Number.isNaN(n) || n < -180 || n > 180) return null;
  return n;
}

type Hub = {
  id: string;
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  createdAt: string;
};

export default function CompanyHubsPage() {
  const [hubs, setHubs] = React.useState<Hub[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [name, setName] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [city, setCity] = React.useState("");
  const [latStr, setLatStr] = React.useState("");
  const [lngStr, setLngStr] = React.useState("");

  const [editDraft, setEditDraft] = React.useState<{
    id: string;
    name: string;
    address: string;
    city: string;
    lat: string;
    lng: string;
  } | null>(null);
  const [editSaving, setEditSaving] = React.useState(false);

  /** Hub IDs in visit order; index 0 is the optimization start depot. */
  const [routeHubIds, setRouteHubIds] = React.useState<string[]>([]);
  const [routeResult, setRouteResult] = React.useState<{
    orderedHubIds: string[];
    hubs: Array<{ id: string; name: string; city: string }>;
    totalDistanceKm: number;
    legs: Array<{ fromHubId: string; toHubId: string; distanceKm: number }>;
  } | null>(null);
  const [routeBusy, setRouteBusy] = React.useState(false);
  const [routeError, setRouteError] = React.useState<string | null>(null);

  const loadHubs = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<{ hubs: Hub[] }>("/api/hubs");
      setHubs(data.hubs ?? []);
    } catch {
      setError("We couldn't load your hubs. Try again in a moment.");
      setHubs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadHubs();
  }, [loadHubs]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const lat = parseLatitude(latStr);
    const lng = parseLongitude(lngStr);
    if (lat == null || lng == null) {
      setError(
        "Check the map pin: latitude should be between −90 and 90, longitude between −180 and 180."
      );
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await api.post("/api/hubs", {
        name: name.trim(),
        address: address.trim(),
        city: city.trim(),
        lat,
        lng,
      });
      setName("");
      setAddress("");
      setCity("");
      setLatStr("");
      setLngStr("");
      await loadHubs();
    } catch {
      setError("Something went wrong while creating this hub. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editDraft) return;
    const lat = parseLatitude(editDraft.lat);
    const lng = parseLongitude(editDraft.lng);
    if (lat == null || lng == null) {
      setError(
        "Check the map pin numbers — latitude and longitude look invalid."
      );
      return;
    }
    setEditSaving(true);
    setError(null);
    try {
      await api.put(`/api/hubs/${editDraft.id}`, {
        name: editDraft.name.trim(),
        address: editDraft.address.trim(),
        city: editDraft.city.trim(),
        lat,
        lng,
      });
      setEditDraft(null);
      await loadHubs();
    } catch {
      setError("We couldn't save your changes. Please try again.");
    } finally {
      setEditSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Hubs</h1>
        <p className="text-muted-foreground">
          Add your depots or warehouses and place them on the map so drivers and
          the live map show the right locations. You can copy numbers from maps
          on your phone or computer.
        </p>
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>Route optimization</CardTitle>
          <CardDescription>
            Choose at least two hubs. Tap them in order — the first stop is where
            the route starts. We&apos;ll suggest a shorter order for the rest
            based on distance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hubs.length < 2 ? (
            <p className="text-sm text-muted-foreground">
              Add at least two hubs to use route optimization.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {hubs.map((h) => {
                  const on = routeHubIds.includes(h.id);
                  return (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => {
                        setRouteResult(null);
                        setRouteError(null);
                        setRouteHubIds((prev) =>
                          prev.includes(h.id)
                            ? prev.filter((id) => id !== h.id)
                            : [...prev, h.id]
                        );
                      }}
                      className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                        on
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:bg-muted/60"
                      }`}
                    >
                      {h.name}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                First selected hub is the fixed start; toggle hubs off to remove.
              </p>
              {routeError ? (
                <p className="text-sm text-destructive" role="alert">
                  {routeError}
                </p>
              ) : null}
              <Button
                type="button"
                disabled={routeHubIds.length < 2 || routeBusy}
                onClick={async () => {
                  const order = [...routeHubIds];
                  setRouteBusy(true);
                  setRouteError(null);
                  setRouteResult(null);
                  try {
                    const { data } = await api.post<{
                      orderedHubIds: string[];
                      hubs: Array<{ id: string; name: string; city: string }>;
                      totalDistanceKm: number;
                      legs: Array<{
                        fromHubId: string;
                        toHubId: string;
                        distanceKm: number;
                      }>;
                    }>("/api/hubs/optimize-route", { hubIds: order });
                    setRouteResult(data);
                  } catch {
                    setRouteError(
                      "We couldn't suggest a route right now. Try again."
                    );
                  } finally {
                    setRouteBusy(false);
                  }
                }}
              >
                {routeBusy ? "Working…" : "Optimize stop order"}
              </Button>
              {routeResult ? (
                <div className="rounded-lg border bg-muted/30 px-3 py-3 text-sm">
                  <p className="font-medium text-foreground">
                    Approximate distance: about {routeResult.totalDistanceKm} km
                  </p>
                  <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted-foreground">
                    {routeResult.hubs.map((h) => (
                      <li key={h.id}>
                        {h.name} — {h.city}
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create hub</CardTitle>
            <CardDescription>
              Name, address, city, and where it sits on the map (all required).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              {error ? (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="hub-name">Name</Label>
                <Input
                  id="hub-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hub-address">Address</Label>
                <Input
                  id="hub-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hub-city">City</Label>
                <Input
                  id="hub-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="hub-lat">Latitude</Label>
                  <Input
                    id="hub-lat"
                    inputMode="decimal"
                    placeholder="e.g. 19.076"
                    value={latStr}
                    onChange={(e) => setLatStr(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hub-lng">Longitude</Label>
                  <Input
                    id="hub-lng"
                    inputMode="decimal"
                    placeholder="e.g. 72.877"
                    value={lngStr}
                    onChange={(e) => setLngStr(e.target.value)}
                    required
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Tip: the first number is how far north or south; the second is
                east or west.
              </p>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Create hub"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All hubs</CardTitle>
            <CardDescription>
              Edit a hub anytime to fix its place on the live map.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 sm:px-6">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead className="hidden md:table-cell">Map pin</TableHead>
                    <TableHead className="hidden sm:table-cell">Address</TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground"
                      >
                        Loading…
                      </TableCell>
                    </TableRow>
                  ) : hubs.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground"
                      >
                        No hubs yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    hubs.map((h) => (
                      <TableRow key={h.id}>
                        <TableCell className="font-medium">{h.name}</TableCell>
                        <TableCell>{h.city}</TableCell>
                        <TableCell className="hidden font-mono text-xs text-muted-foreground md:table-cell">
                          {h.lat.toFixed(4)}, {h.lng.toFixed(4)}
                        </TableCell>
                        <TableCell className="hidden max-w-[200px] truncate text-muted-foreground sm:table-cell">
                          {h.address}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setEditDraft({
                                id: h.id,
                                name: h.name,
                                address: h.address,
                                city: h.city,
                                lat: String(h.lat),
                                lng: String(h.lng),
                              })
                            }
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={editDraft != null}
        onOpenChange={(open) => {
          if (!open) setEditDraft(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          {editDraft ? (
            <form onSubmit={handleSaveEdit}>
              <DialogHeader>
                <DialogTitle>Edit hub</DialogTitle>
                <DialogDescription>
                  Change the name, address, or map position for {editDraft.name}.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={editDraft.name}
                    onChange={(e) =>
                      setEditDraft((d) =>
                        d ? { ...d, name: e.target.value } : d
                      )
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-address">Address</Label>
                  <Input
                    id="edit-address"
                    value={editDraft.address}
                    onChange={(e) =>
                      setEditDraft((d) =>
                        d ? { ...d, address: e.target.value } : d
                      )
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-city">City</Label>
                  <Input
                    id="edit-city"
                    value={editDraft.city}
                    onChange={(e) =>
                      setEditDraft((d) =>
                        d ? { ...d, city: e.target.value } : d
                      )
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="edit-lat">Latitude</Label>
                    <Input
                      id="edit-lat"
                      inputMode="decimal"
                      value={editDraft.lat}
                      onChange={(e) =>
                        setEditDraft((d) =>
                          d ? { ...d, lat: e.target.value } : d
                        )
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-lng">Longitude</Label>
                    <Input
                      id="edit-lng"
                      inputMode="decimal"
                      value={editDraft.lng}
                      onChange={(e) =>
                        setEditDraft((d) =>
                          d ? { ...d, lng: e.target.value } : d
                        )
                      }
                      required
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditDraft(null)}
                  disabled={editSaving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={editSaving}>
                  {editSaving ? "Saving…" : "Save"}
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
