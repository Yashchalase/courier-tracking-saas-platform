"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import api from "@/lib/axios";

type AgentRow = {
  id: string;
  isAvailable: boolean;
  user: { id: string; email: string; name?: string | null };
  hub: { id: string; name: string; city: string };
};

export default function CompanyAgentsPage() {
  const [agents, setAgents] = React.useState<AgentRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [agName, setAgName] = React.useState("");
  const [agEmail, setAgEmail] = React.useState("");
  const [agPassword, setAgPassword] = React.useState("");
  const [creating, setCreating] = React.useState(false);

  const loadAgents = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<{ agents: AgentRow[] }>("/api/agents");
      setAgents(data.agents ?? []);
    } catch {
      setError("We couldn't load your drivers list. Try again.");
      setAgents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadAgents();
  }, [loadAgents]);

  async function handleCreateAgent(e: React.FormEvent) {
    e.preventDefault();
    if (!agEmail || !agPassword) return;
    setCreating(true);
    setError(null);
    try {
      await api.post("/api/company/agents", {
        name: agName.trim() || undefined,
        email: agEmail,
        password: agPassword,
      });
      setAgName("");
      setAgEmail("");
      setAgPassword("");
      setDialogOpen(false);
      await loadAgents();
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { error?: string } } };
      setError(
        ax.response?.data?.error ??
          "We couldn't add this driver. Check the email and password."
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Agents</h1>
          <p className="text-muted-foreground">
            Delivery agents in your tenant and their availability. New agents are assigned to the
            first hub of your organization.
          </p>
        </div>
        <Button type="button" onClick={() => setDialogOpen(true)}>
          Create delivery agent
        </Button>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Team</CardTitle>
          <CardDescription>
            Green means available for assignment; red means unavailable.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:px-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"> </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Hub</TableHead>
                  <TableHead className="hidden md:table-cell">City</TableHead>
                  <TableHead>Availability</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground"
                    >
                      Loading…
                    </TableCell>
                  </TableRow>
                ) : agents.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground"
                    >
                      No agents found.
                    </TableCell>
                  </TableRow>
                ) : (
                  agents.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>
                        <span
                          className="inline-block h-3 w-3 rounded-full"
                          style={{
                            backgroundColor: a.isAvailable ? "#22c55e" : "#ef4444",
                          }}
                          title={a.isAvailable ? "Available" : "Unavailable"}
                          aria-label={
                            a.isAvailable ? "Available" : "Unavailable"
                          }
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {a.user.name ?? "—"}
                      </TableCell>
                      <TableCell>{a.user.email}</TableCell>
                      <TableCell>{a.hub.name}</TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">
                        {a.hub.city}
                      </TableCell>
                      <TableCell>
                        <Badge variant={a.isAvailable ? "success" : "destructive"}>
                          {a.isAvailable ? "Available" : "Unavailable"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create delivery agent</DialogTitle>
            <DialogDescription>
              Creates a user with the delivery agent role and links them to your first hub.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateAgent} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ag-name">Name</Label>
              <Input
                id="ag-name"
                value={agName}
                onChange={(e) => setAgName(e.target.value)}
                placeholder="Agent name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ag-email">Email</Label>
              <Input
                id="ag-email"
                type="email"
                required
                value={agEmail}
                onChange={(e) => setAgEmail(e.target.value)}
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ag-password">Password</Label>
              <Input
                id="ag-password"
                type="password"
                minLength={8}
                required
                value={agPassword}
                onChange={(e) => setAgPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={creating}>
                {creating ? "Creating…" : "Create agent"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={creating}
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
