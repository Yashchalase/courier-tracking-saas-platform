"use client";

import * as React from "react";
import axios from "axios";

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
import api from "@/lib/axios";

type TenantRow = {
  id: string;
  name: string;
  slug?: string;
  createdAt?: string;
  subscriptionPlanId?: string | null;
  subscriptionPlan?: { id: string; name: string } | null;
};

type CompanyAdminRow = {
  id: string;
  email: string;
  name: string | null;
  tenantId: string;
  createdAt?: string;
  tenant?: { id: string; name: string; slug: string };
};

const PLATFORM_SLUG = "platform";

type Plan = {
  id: string;
  name: string;
  maxShipments: number;
  price: number;
  createdAt?: string;
};

function coerceNumber(value: string, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export default function AdminDashboardPage() {
  const [tenants, setTenants] = React.useState<TenantRow[]>([]);
  const [plans, setPlans] = React.useState<Plan[]>([]);
  const [loadingTenants, setLoadingTenants] = React.useState(true);
  const [loadingPlans, setLoadingPlans] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [planDialogOpen, setPlanDialogOpen] = React.useState(false);
  const [editingPlan, setEditingPlan] = React.useState<Plan | null>(null);
  const [savingPlan, setSavingPlan] = React.useState(false);
  const [planName, setPlanName] = React.useState("");
  const [planMaxShipments, setPlanMaxShipments] = React.useState("0");
  const [planPrice, setPlanPrice] = React.useState("0");

  const [assignTenantId, setAssignTenantId] = React.useState<string>("");
  const [assignPlanId, setAssignPlanId] = React.useState<string>("");
  const [assigning, setAssigning] = React.useState(false);

  const [companyAdmins, setCompanyAdmins] = React.useState<CompanyAdminRow[]>([]);
  const [loadingAdmins, setLoadingAdmins] = React.useState(true);
  const [caName, setCaName] = React.useState("");
  const [caEmail, setCaEmail] = React.useState("");
  const [caPassword, setCaPassword] = React.useState("");
  const [caTenantId, setCaTenantId] = React.useState<string>("");
  const [creatingCa, setCreatingCa] = React.useState(false);

  const [newTenantName, setNewTenantName] = React.useState("");
  const [newTenantSlug, setNewTenantSlug] = React.useState("");
  const [creatingTenant, setCreatingTenant] = React.useState(false);
  const [tenantFormError, setTenantFormError] = React.useState<string | null>(null);
  const [tenantFormSuccess, setTenantFormSuccess] = React.useState<string | null>(null);

  const loadTenants = React.useCallback(async () => {
    setLoadingTenants(true);
    setError(null);
    try {
      const { data } = await api.get<{ tenants: TenantRow[] }>("/api/admin/tenants");
      setTenants(data.tenants ?? []);
    } catch {
      setError("We couldn't load organizations. Try again.");
      setTenants([]);
    } finally {
      setLoadingTenants(false);
    }
  }, []);

  const loadPlans = React.useCallback(async () => {
    setLoadingPlans(true);
    setError(null);
    try {
      const { data } = await api.get<{ data?: { plans?: Plan[] } }>("/api/subscriptions");
      const rows = data.data?.plans ?? [];
      setPlans(rows);
    } catch {
      setError("We couldn't load subscription plans. Try again.");
      setPlans([]);
    } finally {
      setLoadingPlans(false);
    }
  }, []);

  const loadCompanyAdmins = React.useCallback(async () => {
    setLoadingAdmins(true);
    setError(null);
    try {
      const { data } = await api.get<{ users: CompanyAdminRow[] }>(
        "/api/admin/users",
        { params: { role: "COMPANY_ADMIN" } }
      );
      setCompanyAdmins(data.users ?? []);
    } catch {
      setError("We couldn't load company admins. Try again.");
      setCompanyAdmins([]);
    } finally {
      setLoadingAdmins(false);
    }
  }, []);

  React.useEffect(() => {
    void loadTenants();
    void loadPlans();
    void loadCompanyAdmins();
  }, [loadTenants, loadPlans, loadCompanyAdmins]);

  const courierTenants = React.useMemo(
    () => tenants.filter((t) => (t.slug ?? "") !== PLATFORM_SLUG),
    [tenants]
  );

  async function createCompanyAdmin(e: React.FormEvent) {
    e.preventDefault();
    if (!caTenantId || !caEmail || !caPassword) return;
    setCreatingCa(true);
    setError(null);
    try {
      await api.post("/api/admin/users", {
        name: caName.trim() || undefined,
        email: caEmail,
        password: caPassword,
        role: "COMPANY_ADMIN",
        tenantId: caTenantId,
      });
      setCaName("");
      setCaEmail("");
      setCaPassword("");
      setCaTenantId("");
      await loadCompanyAdmins();
    } catch {
      setError("We couldn't create that company admin. Check the form and try again.");
    } finally {
      setCreatingCa(false);
    }
  }

  function openCreatePlan() {
    setEditingPlan(null);
    setPlanName("");
    setPlanMaxShipments("0");
    setPlanPrice("0");
    setPlanDialogOpen(true);
  }

  function openEditPlan(plan: Plan) {
    setEditingPlan(plan);
    setPlanName(plan.name ?? "");
    setPlanMaxShipments(String(plan.maxShipments ?? 0));
    setPlanPrice(String(plan.price ?? 0));
    setPlanDialogOpen(true);
  }

  async function savePlan(e: React.FormEvent) {
    e.preventDefault();
    setSavingPlan(true);
    setError(null);
    try {
      const payload = {
        name: planName.trim(),
        maxShipments: coerceNumber(planMaxShipments, 0),
        price: coerceNumber(planPrice, 0),
      };
      if (editingPlan) {
        await api.put(`/api/subscriptions/${editingPlan.id}`, payload);
      } else {
        await api.post("/api/subscriptions", payload);
      }
      setPlanDialogOpen(false);
      setEditingPlan(null);
      await loadPlans();
    } catch {
      setError("We couldn't save this plan. Try again.");
    } finally {
      setSavingPlan(false);
    }
  }

  async function assignPlan(e: React.FormEvent) {
    e.preventDefault();
    if (!assignTenantId || !assignPlanId) return;
    setAssigning(true);
    setError(null);
    try {
      await api.post("/api/subscriptions/assign", {
        tenantId: assignTenantId,
        subscriptionPlanId: assignPlanId,
      });
      await loadTenants();
    } catch {
      setError("We couldn't assign this plan. Try again.");
    } finally {
      setAssigning(false);
    }
  }

  async function createTenant(e: React.FormEvent) {
    e.preventDefault();
    const name = newTenantName.trim();
    const slug = newTenantSlug.trim();
    if (!name || !slug) return;
    setCreatingTenant(true);
    setTenantFormError(null);
    setTenantFormSuccess(null);
    try {
      await api.post("/api/admin/tenants", { name, slug });
      setNewTenantName("");
      setNewTenantSlug("");
      setTenantFormSuccess("Tenant created successfully.");
      await loadTenants();
    } catch (err) {
      const message =
        axios.isAxiosError(err) && typeof err.response?.data?.error === "string"
          ? err.response.data.error
          : "We couldn't create this organization. Try a different code or name.";
      setTenantFormError(message);
    } finally {
      setCreatingTenant(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Super admin</h1>
        <p className="text-muted-foreground">Manage tenants and subscription plans.</p>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="grid gap-8 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tenants</CardTitle>
            <CardDescription>Courier companies on the platform.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="mb-3 text-sm font-medium">Create tenant</h3>
              <form onSubmit={createTenant} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="tenant-name">Tenant name</Label>
                    <Input
                      id="tenant-name"
                      value={newTenantName}
                      onChange={(e) => setNewTenantName(e.target.value)}
                      placeholder="Acme Courier"
                      required
                      maxLength={120}
                      autoComplete="organization"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tenant-slug">Sign-in code</Label>
                    <Input
                      id="tenant-slug"
                      value={newTenantSlug}
                      onChange={(e) => setNewTenantSlug(e.target.value)}
                      placeholder="acme-courier"
                      required
                      maxLength={64}
                      autoComplete="off"
                      spellCheck={false}
                    />
                    <p className="text-xs text-muted-foreground">
                      Lowercase, no spaces (letters, numbers, hyphens).
                    </p>
                  </div>
                </div>
                <Button type="submit" disabled={creatingTenant}>
                  {creatingTenant ? "Creating…" : "Create tenant"}
                </Button>
              </form>
              {tenantFormSuccess ? (
                <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-500" role="status">
                  {tenantFormSuccess}
                </p>
              ) : null}
              {tenantFormError ? (
                <p className="mt-3 text-sm text-destructive" role="alert">
                  {tenantFormError}
                </p>
              ) : null}
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingTenants ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground">
                        Loading…
                      </TableCell>
                    </TableRow>
                  ) : tenants.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground">
                        No tenants found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    tenants.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium">{t.name}</TableCell>
                        <TableCell className="hidden text-muted-foreground md:table-cell">
                          {t.createdAt ? new Date(t.createdAt).toLocaleString() : "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assign plan to tenant</CardTitle>
            <CardDescription>Select a tenant and subscription plan.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={assignPlan} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tenant</Label>
                  <Select value={assignTenantId} onValueChange={setAssignTenantId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tenant" />
                    </SelectTrigger>
                    <SelectContent>
                      {tenants.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Plan</Label>
                  <Select value={assignPlanId} onValueChange={setAssignPlanId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" disabled={!assignTenantId || !assignPlanId || assigning}>
                {assigning ? "Assigning…" : "Assign plan"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company admins</CardTitle>
          <CardDescription>
            Create an admin for a courier company. They sign in using that company&apos;s organization code.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <form onSubmit={createCompanyAdmin} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="ca-name">Name</Label>
                <Input
                  id="ca-name"
                  value={caName}
                  onChange={(e) => setCaName(e.target.value)}
                  placeholder="Full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ca-email">Email</Label>
                <Input
                  id="ca-email"
                  type="email"
                  required
                  value={caEmail}
                  onChange={(e) => setCaEmail(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ca-password">Password</Label>
                <Input
                  id="ca-password"
                  type="password"
                  minLength={8}
                  required
                  value={caPassword}
                  onChange={(e) => setCaPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-2">
                <Label>Tenant</Label>
                <Select value={caTenantId} onValueChange={setCaTenantId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tenant" />
                  </SelectTrigger>
                  <SelectContent>
                    {courierTenants.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                        {t.slug ? ` (${t.slug})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" disabled={!caTenantId || creatingCa}>
              {creatingCa ? "Creating…" : "Create company admin"}
            </Button>
          </form>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="hidden md:table-cell">Tenant</TableHead>
                  <TableHead className="hidden lg:table-cell">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingAdmins ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Loading…
                    </TableCell>
                  </TableRow>
                ) : companyAdmins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No company admins yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  companyAdmins.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">
                        {u.name ?? "—"}
                      </TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">
                        {u.tenant?.name ?? u.tenantId}
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground lg:table-cell">
                        {u.createdAt ? new Date(u.createdAt).toLocaleString() : "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-4 space-y-0 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <CardTitle>Subscription plans</CardTitle>
            <CardDescription>Create, edit, and review plan limits.</CardDescription>
          </div>
          <Button
            type="button"
            className="w-full shrink-0 sm:w-auto"
            onClick={openCreatePlan}
          >
            Create plan
          </Button>
        </CardHeader>
        <CardContent className="p-0 sm:px-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Max shipments</TableHead>
                  <TableHead className="hidden sm:table-cell">Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingPlans ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Loading…
                    </TableCell>
                  </TableRow>
                ) : plans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center">
                      <p className="mb-3 text-muted-foreground">No plans yet.</p>
                      <Button type="button" size="sm" onClick={openCreatePlan}>
                        Create plan
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  plans.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {p.maxShipments}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {Number(p.price).toLocaleString(undefined, {
                          style: "currency",
                          currency: "USD",
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => openEditPlan(p)}
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

      <Dialog
        open={planDialogOpen}
        onOpenChange={(o) => {
          if (!o) {
            setPlanDialogOpen(false);
            setEditingPlan(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingPlan ? "Edit plan" : "Create plan"}</DialogTitle>
            <DialogDescription>
              Configure limits and pricing for a tenant subscription.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={savePlan} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="plan-name">Name</Label>
              <Input
                id="plan-name"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="plan-max">Max shipments</Label>
                <Input
                  id="plan-max"
                  inputMode="numeric"
                  value={planMaxShipments}
                  onChange={(e) => setPlanMaxShipments(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-price">Price</Label>
                <Input
                  id="plan-price"
                  inputMode="decimal"
                  value={planPrice}
                  onChange={(e) => setPlanPrice(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={savingPlan}>
                {savingPlan ? "Saving…" : "Save"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPlanDialogOpen(false)}
                disabled={savingPlan}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
