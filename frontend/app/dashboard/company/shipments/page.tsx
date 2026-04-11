"use client";

import * as React from "react";

import { CreateShipmentModal } from "@/components/dashboard/company/create-shipment-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getApiErrorMessage } from "@/lib/api-error";
import api from "@/lib/axios";
import {
  formatShipmentStatus,
  SHIPMENT_STATUSES,
  statusBadgeVariant,
} from "@/lib/shipment-status";

type ShipmentRow = {
  id: string;
  trackingId: string;
  recipientName: string;
  status: string;
  createdAt: string;
};

type HubOption = { id: string; name: string; city: string };

/** Matches GET /api/shipments/:id `shipment` payload (Prisma include). */
type ShipmentDetailHub = {
  id: string;
  name: string;
  city: string;
};

type ShipmentDetailEvent = {
  id: string;
  status: string;
  note: string | null;
  createdAt: string;
};

type ShipmentDetailAssignedAgent = {
  user?: { id: string; email: string; name?: string | null } | null;
};

type AgentOption = {
  id: string;
  user?: { id: string; email: string; name?: string | null } | null;
};

type ShipmentDetail = {
  id: string;
  trackingId: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  status: string;
  estimatedDelivery: string | null;
  createdAt: string;
  originHub: ShipmentDetailHub;
  destinationHub: ShipmentDetailHub;
  assignedAgent: ShipmentDetailAssignedAgent | null;
  events: ShipmentDetailEvent[];
};

function formatDateTime(value: string | null | undefined): string {
  if (value == null || value === "") return "Not available";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Not available";
  return d.toLocaleString();
}

function assignedAgentLabel(
  agent: ShipmentDetailAssignedAgent | null | undefined
): string {
  if (!agent) return "Not assigned";
  const name = agent.user?.name?.trim();
  if (name) return name;
  const email = agent.user?.email?.trim();
  return email || "Not assigned";
}

function agentSelectLabel(a: AgentOption): string {
  const name = a.user?.name?.trim();
  if (name) return name;
  const email = a.user?.email?.trim();
  return email || a.id;
}

export default function CompanyShipmentsPage() {
  const [shipments, setShipments] = React.useState<ShipmentRow[]>([]);
  const [page, setPage] = React.useState(1);
  const limit = 20;
  const [paginationMeta, setPaginationMeta] = React.useState<{
    total: number;
    totalPages: number;
  } | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<string>("");
  const [search, setSearch] = React.useState("");
  const [searchInput, setSearchInput] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [hubs, setHubs] = React.useState<HubOption[]>([]);
  const [viewId, setViewId] = React.useState<string | null>(null);
  const [viewShipment, setViewShipment] = React.useState<ShipmentDetail | null>(
    null
  );
  const [viewLoading, setViewLoading] = React.useState(false);
  const [viewErrorMessage, setViewErrorMessage] = React.useState<string | null>(
    null
  );
  const [assignAgents, setAssignAgents] = React.useState<AgentOption[]>([]);
  const [assignAgentsLoading, setAssignAgentsLoading] = React.useState(false);
  const [selectedAgentId, setSelectedAgentId] = React.useState<string>("");
  const [assignSubmitting, setAssignSubmitting] = React.useState(false);
  const [assignError, setAssignError] = React.useState<string | null>(null);
  const [hubOriginId, setHubOriginId] = React.useState("");
  const [hubDestId, setHubDestId] = React.useState("");
  const [hubSaving, setHubSaving] = React.useState(false);
  const [hubError, setHubError] = React.useState<string | null>(null);

  const loadHubs = React.useCallback(async () => {
    try {
      const { data } = await api.get<{ hubs: HubOption[] }>("/api/hubs");
      setHubs(data.hubs ?? []);
    } catch {
      setHubs([]);
    }
  }, []);

  const loadShipments = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = {
        page,
        limit,
      };
      if (statusFilter) params.status = statusFilter;
      if (search.trim()) params.trackingId = search.trim();

      const { data } = await api.get<{
        shipments: ShipmentRow[];
        pagination?: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>("/api/shipments", { params });

      setShipments(data.shipments ?? []);
      if (data.pagination) {
        setPaginationMeta({
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
        });
      } else {
        setPaginationMeta(null);
      }
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "We couldn't load shipments. Try refreshing the page."
        )
      );
      setShipments([]);
      setPaginationMeta(null);
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter, search]);

  React.useEffect(() => {
    loadHubs();
  }, [loadHubs]);

  React.useEffect(() => {
    loadShipments();
  }, [loadShipments]);

  React.useEffect(() => {
    if (!viewId) {
      setViewShipment(null);
      setViewLoading(false);
      setViewErrorMessage(null);
      return;
    }
    let cancelled = false;
    setViewShipment(null);
    setViewErrorMessage(null);
    setViewLoading(true);
    (async () => {
      try {
        const { data } = await api.get<{ shipment: ShipmentDetail }>(
          `/api/shipments/${viewId}`
        );
        if (!cancelled) {
          setViewShipment(data.shipment);
          setViewErrorMessage(null);
        }
      } catch (err) {
        if (!cancelled) {
          setViewShipment(null);
          setViewErrorMessage(
            getApiErrorMessage(
              err,
              "We couldn't load this shipment. Try again or pick another row."
            )
          );
        }
      } finally {
        if (!cancelled) setViewLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [viewId]);

  const showAssignAgentSection = React.useMemo(() => {
    if (!viewShipment) return false;
    if (viewShipment.assignedAgent != null) return false;
    const s = viewShipment.status;
    return s === "CREATED" || s === "PICKED_UP";
  }, [viewShipment]);

  React.useEffect(() => {
    if (!viewId || !showAssignAgentSection) {
      setAssignAgents([]);
      setSelectedAgentId("");
      setAssignError(null);
      return;
    }
    let cancelled = false;
    setAssignAgentsLoading(true);
    setAssignError(null);
    (async () => {
      try {
        const { data } = await api.get<{ agents: AgentOption[] }>(
          "/api/agents"
        );
        if (!cancelled) {
          setAssignAgents(data.agents ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setAssignAgents([]);
          setAssignError(
            getApiErrorMessage(
              err,
              "We couldn't load drivers for assignment. Try again."
            )
          );
        }
      } finally {
        if (!cancelled) setAssignAgentsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [viewId, showAssignAgentSection]);

  React.useEffect(() => {
    if (!viewShipment) {
      setHubOriginId("");
      setHubDestId("");
      setHubError(null);
      return;
    }
    setHubOriginId(viewShipment.originHub.id);
    setHubDestId(viewShipment.destinationHub.id);
    setHubError(null);
  }, [viewShipment]);

  async function refreshViewShipment() {
    if (!viewId) return;
    try {
      const { data } = await api.get<{ shipment: ShipmentDetail }>(
        `/api/shipments/${viewId}`
      );
      setViewShipment(data.shipment);
      setViewErrorMessage(null);
    } catch (err) {
      setViewErrorMessage(
        getApiErrorMessage(
          err,
          "We couldn't refresh this shipment. Try closing and opening again."
        )
      );
    }
  }

  async function handleUpdateHubs() {
    if (!viewId || !viewShipment) return;
    const originChanged = hubOriginId !== viewShipment.originHub.id;
    const destChanged = hubDestId !== viewShipment.destinationHub.id;
    if (!originChanged && !destChanged) {
      setHubError("Select a different hub to apply a change.");
      return;
    }
    setHubSaving(true);
    setHubError(null);
    try {
      const body: { originHubId?: string; destinationHubId?: string } = {};
      if (originChanged) body.originHubId = hubOriginId;
      if (destChanged) body.destinationHubId = hubDestId;
      await api.patch(`/api/shipments/${viewId}/hubs`, body);
      await refreshViewShipment();
    } catch (err) {
      setHubError(
        getApiErrorMessage(
          err,
          "We couldn't update the hubs. Check your selections and try again."
        )
      );
    } finally {
      setHubSaving(false);
    }
  }

  async function handleAssignAgent() {
    if (!viewId || !selectedAgentId) return;
    setAssignSubmitting(true);
    setAssignError(null);
    try {
      await api.post(`/api/shipments/${viewId}/assign-agent`, {
        agentId: selectedAgentId,
      });
      await refreshViewShipment();
      setSelectedAgentId("");
    } catch (err) {
      setAssignError(
        getApiErrorMessage(
          err,
          "We couldn't assign this driver. Try again."
        )
      );
    } finally {
      setAssignSubmitting(false);
    }
  }

  function applySearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  function goToPage(next: number) {
    const max = paginationMeta?.totalPages ?? 1;
    const clamped = Math.max(1, Math.min(next, max));
    setPage(clamped);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Shipments</h1>
          <p className="text-muted-foreground">
            Search, filter, and create new shipments.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>Create shipment</Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
        <form onSubmit={applySearch} className="flex flex-1 flex-col gap-2 sm:max-w-sm">
          <Label htmlFor="track-search">Tracking ID</Label>
          <div className="flex gap-2">
            <Input
              id="track-search"
              placeholder="Search by tracking ID"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <Button type="submit" variant="secondary">
              Search
            </Button>
          </div>
        </form>
        <div className="flex flex-col gap-2 sm:w-52">
          <Label>Status</Label>
          <Select
            value={statusFilter || "all"}
            onValueChange={(v) => {
              setStatusFilter(v === "all" ? "" : v);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {SHIPMENT_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {formatShipmentStatus(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tracking ID</TableHead>
              <TableHead>Recipient</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : shipments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No shipments found.
                </TableCell>
              </TableRow>
            ) : (
              shipments.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-sm">{s.trackingId}</TableCell>
                  <TableCell>{s.recipientName}</TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant(s.status)}>
                      {formatShipmentStatus(s.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {new Date(s.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => setViewId(s.id)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {paginationMeta && paginationMeta.totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            Page {page} of {paginationMeta.totalPages} ({paginationMeta.total}{" "}
            total)
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => goToPage(page - 1)}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= paginationMeta.totalPages}
              onClick={() => goToPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      <CreateShipmentModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        hubs={hubs}
        onCreated={() => {
          loadShipments();
        }}
      />

      <Dialog open={!!viewId} onOpenChange={(o) => !o && setViewId(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Shipment details</DialogTitle>
            <DialogDescription>
              Tracking and delivery information for this shipment.
            </DialogDescription>
          </DialogHeader>
          {viewLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : viewErrorMessage ? (
            <p className="text-sm text-destructive" role="alert">
              {viewErrorMessage}
            </p>
          ) : viewShipment ? (
            <div className="space-y-4">
              <div className="rounded-lg border bg-card p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-medium text-foreground">
                  Shipment
                </h3>
                <dl className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Tracking ID
                    </dt>
                    <dd className="mt-0.5 font-mono text-sm">
                      {viewShipment.trackingId}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Recipient name
                    </dt>
                    <dd className="mt-0.5 text-sm">{viewShipment.recipientName}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Recipient phone
                    </dt>
                    <dd className="mt-0.5 text-sm">{viewShipment.recipientPhone}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Recipient address
                    </dt>
                    <dd className="mt-0.5 text-sm">{viewShipment.recipientAddress}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Origin hub
                    </dt>
                    <dd className="mt-0.5 text-sm">
                      {viewShipment.originHub.name}
                      <span className="text-muted-foreground">
                        {" "}
                        · {viewShipment.originHub.city}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Destination hub
                    </dt>
                    <dd className="mt-0.5 text-sm">
                      {viewShipment.destinationHub.name}
                      <span className="text-muted-foreground">
                        {" "}
                        · {viewShipment.destinationHub.city}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Assigned agent
                    </dt>
                    <dd className="mt-0.5 text-sm break-all">
                      {assignedAgentLabel(viewShipment.assignedAgent)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Current status
                    </dt>
                    <dd className="mt-0.5">
                      <Badge variant={statusBadgeVariant(viewShipment.status)}>
                        {formatShipmentStatus(viewShipment.status)}
                      </Badge>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Estimated delivery
                    </dt>
                    <dd className="mt-0.5 text-sm">
                      {viewShipment.estimatedDelivery
                        ? formatDateTime(viewShipment.estimatedDelivery)
                        : "Not available"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Created at
                    </dt>
                    <dd className="mt-0.5 text-sm">
                      {formatDateTime(viewShipment.createdAt)}
                    </dd>
                  </div>
                </dl>
              </div>

              {hubs.length > 0 ? (
                <div className="rounded-lg border bg-card p-4 shadow-sm">
                  <h3 className="mb-3 text-sm font-medium text-foreground">
                    Reassign hubs
                  </h3>
                  <p className="mb-3 text-sm text-muted-foreground">
                    Change origin or destination warehouse routing for this
                    shipment. A timeline entry is recorded.
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="flex flex-1 flex-col gap-2">
                      <Label htmlFor="hub-origin-select">Origin hub</Label>
                      <Select
                        value={hubOriginId || undefined}
                        onValueChange={setHubOriginId}
                      >
                        <SelectTrigger id="hub-origin-select">
                          <SelectValue placeholder="Origin" />
                        </SelectTrigger>
                        <SelectContent>
                          {hubs.map((h) => (
                            <SelectItem key={h.id} value={h.id}>
                              {h.name} · {h.city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-1 flex-col gap-2">
                      <Label htmlFor="hub-dest-select">Destination hub</Label>
                      <Select
                        value={hubDestId || undefined}
                        onValueChange={setHubDestId}
                      >
                        <SelectTrigger id="hub-dest-select">
                          <SelectValue placeholder="Destination" />
                        </SelectTrigger>
                        <SelectContent>
                          {hubs.map((h) => (
                            <SelectItem key={h.id} value={h.id}>
                              {h.name} · {h.city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={hubSaving}
                      onClick={() => void handleUpdateHubs()}
                    >
                      {hubSaving ? "Saving…" : "Update hubs"}
                    </Button>
                  </div>
                  {hubError ? (
                    <p className="mt-2 text-sm text-destructive" role="alert">
                      {hubError}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {showAssignAgentSection ? (
                <div className="rounded-lg border bg-card p-4 shadow-sm">
                  <h3 className="mb-3 text-sm font-medium text-foreground">
                    Assign agent
                  </h3>
                  {assignAgentsLoading ? (
                    <p className="text-sm text-muted-foreground">Loading agents…</p>
                  ) : assignError && assignAgents.length === 0 ? (
                    <p className="text-sm text-destructive" role="alert">
                      {assignError}
                    </p>
                  ) : assignAgents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No delivery agents are available for this organization.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                      <div className="flex flex-1 flex-col gap-2">
                        <Label htmlFor="assign-agent-select">Agent</Label>
                        <Select
                          value={selectedAgentId || undefined}
                          onValueChange={setSelectedAgentId}
                        >
                          <SelectTrigger id="assign-agent-select">
                            <SelectValue placeholder="Select an agent" />
                          </SelectTrigger>
                          <SelectContent>
                            {assignAgents.map((a) => (
                              <SelectItem key={a.id} value={a.id}>
                                {agentSelectLabel(a)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        type="button"
                        disabled={!selectedAgentId || assignSubmitting}
                        onClick={() => void handleAssignAgent()}
                      >
                        {assignSubmitting ? "Assigning…" : "Assign agent"}
                      </Button>
                    </div>
                  )}
                  {assignError && assignAgents.length > 0 ? (
                    <p className="mt-2 text-sm text-destructive" role="alert">
                      {assignError}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <div className="rounded-lg border bg-card p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-medium text-foreground">
                  Events timeline
                </h3>
                {!viewShipment.events?.length ? (
                  <p className="text-sm text-muted-foreground">
                    No events are available for this shipment yet.
                  </p>
                ) : (
                  <ul className="relative space-y-0 border-l border-border pl-4">
                    {viewShipment.events.map((ev) => (
                      <li key={ev.id} className="relative pb-6 last:pb-0">
                        <span
                          className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-border ring-4 ring-card"
                          aria-hidden
                        />
                        <div className="space-y-1 pl-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={statusBadgeVariant(ev.status)}>
                              {formatShipmentStatus(ev.status)}
                            </Badge>
                            <time
                              className="text-xs text-muted-foreground"
                              dateTime={ev.createdAt}
                            >
                              {formatDateTime(ev.createdAt)}
                            </time>
                          </div>
                          {ev.note ? (
                            <p className="text-sm text-foreground">{ev.note}</p>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">
                              No note
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
