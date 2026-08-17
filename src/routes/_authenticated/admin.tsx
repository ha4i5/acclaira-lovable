import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AdminUser, AuditEntry } from "@/lib/admin.functions";
import { adjustCredits, adminStats, isAdmin, listUsers, setModuleRate, setUserPlan, setUserRole, listAuditLog } from "@/lib/admin.functions";
import type { AdminStats } from "@/lib/admin.functions";
import type { Rate } from "@/lib/studio.functions";
import { listRates } from "@/lib/studio.functions";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin console — Acclaira" },
      { name: "description", content: "Manage Acclaira members, roles, plans and credits." },
      { property: "og:title", content: "Admin console — Acclaira" },
      { property: "og:description", content: "Manage Acclaira members, roles, plans and credits." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const checkAdmin = useServerFn(isAdmin);
  const fetchUsers = useServerFn(listUsers);
  const fetchAudit = useServerFn(listAuditLog);
  const changeRole = useServerFn(setUserRole);
  const changePlan = useServerFn(setUserPlan);
  const changeCredits = useServerFn(adjustCredits);
  const changeRate = useServerFn(setModuleRate);
  const fetchStats = useServerFn(adminStats);
  const fetchRates = useServerFn(listRates);
  const qc = useQueryClient();
  const [creditDraft, setCreditDraft] = useState<Record<string, string>>({});
  const [rateDraft, setRateDraft] = useState<Record<string, string>>({});

  const adminQ = useQuery({ queryKey: ["is-admin"], queryFn: () => checkAdmin() });
  const allowed = adminQ.data?.isAdmin === true;

  const usersQ = useQuery({ queryKey: ["admin-users"], queryFn: () => fetchUsers() as Promise<AdminUser[]>, enabled: allowed });
  const auditQ = useQuery({ queryKey: ["admin-audit"], queryFn: () => fetchAudit() as Promise<AuditEntry[]>, enabled: allowed });

  const statsQ = useQuery({ queryKey: ["admin-stats"], queryFn: () => fetchStats() as Promise<AdminStats>, enabled: allowed });
  const ratesQ = useQuery({ queryKey: ["rates"], queryFn: () => fetchRates() as Promise<Rate[]>, enabled: allowed });

  const refreshAll = () => {
    qc.invalidateQueries({ queryKey: ["admin-users"] });
    qc.invalidateQueries({ queryKey: ["admin-audit"] });
    qc.invalidateQueries({ queryKey: ["admin-stats"] });
    qc.invalidateQueries({ queryKey: ["rates"] });
  };

  const planM = useMutation({
    mutationFn: (vars: { userId: string; plan: string }) => changePlan({ data: vars }),
    onSuccess: () => { toast.success("Plan updated"); refreshAll(); },
    onError: () => toast.error("Could not update plan"),
  });

  const creditsM = useMutation({
    mutationFn: (vars: { userId: string; amount: number; reason: string }) => changeCredits({ data: vars }),
    onSuccess: () => { toast.success("Credits adjusted"); refreshAll(); },
    onError: () => toast.error("Could not adjust credits"),
  });

  const rateM = useMutation({
    mutationFn: (vars: { moduleKey: string; credits: number }) => changeRate({ data: vars }),
    onSuccess: () => { toast.success("Rate updated"); refreshAll(); },
    onError: () => toast.error("Could not update rate"),
  });

  const roleM = useMutation({
    mutationFn: (vars: { userId: string; role: "admin" | "user" }) => changeRole({ data: vars }),
    onSuccess: () => {
      toast.success("Role updated");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-audit"] });
    },
    onError: () => toast.error("Could not update role"),
  });

  if (adminQ.isLoading) {
    return <Shell><p className="text-sm text-muted-foreground">Checking permissions…</p></Shell>;
  }

  if (!allowed) {
    return (
      <Shell>
        <h1 className="font-display text-2xl font-bold">Not authorised</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This area is restricted to Acclaira administrators.
        </p>
      </Shell>
    );
  }

  return (
    <Shell>
      <h1 className="font-display text-3xl font-bold">Admin console</h1>
      <p className="mt-1.5 text-muted-foreground">Members, roles, credits and activity.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        <StatCard label="Members" value={statsQ.data?.users} />
        <StatCard label="Admins" value={statsQ.data?.admins} />
        <StatCard label="Generations" value={statsQ.data?.generations} />
        <StatCard label="Credits outstanding" value={statsQ.data?.creditsOutstanding} />
      </div>

      <section className="mt-10">
        <h2 className="font-display text-xl font-bold">Pricing editor</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {(ratesQ.data ?? []).map((r) => (
            <div key={r.module_key} className="rounded-2xl border border-border bg-card p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{r.label}</p>
              <div className="mt-3 flex gap-2">
                <Input
                  type="number"
                  min={0}
                  value={rateDraft[r.module_key] ?? String(r.credits)}
                  onChange={(e) => setRateDraft((d) => ({ ...d, [r.module_key]: e.target.value }))}
                  className="h-9"
                />
                <Button
                  size="sm"
                  onClick={() =>
                    rateM.mutate({
                      moduleKey: r.module_key,
                      credits: Number(rateDraft[r.module_key] ?? r.credits),
                    })
                  }
                >
                  Save
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">Members</h2>
          <Button variant="outline" size="sm" onClick={() => usersQ.refetch()}>
            Refresh
          </Button>
        </div>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Credits</th>
                <th className="px-4 py-3">Referral</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Adjust credits</th>
              </tr>
            </thead>
            <tbody>
              {usersQ.isLoading ? (
                <tr><td className="px-4 py-6 text-muted-foreground" colSpan={6}>Loading members…</td></tr>
              ) : (usersQ.data ?? []).length === 0 ? (
                <tr><td className="px-4 py-6 text-muted-foreground" colSpan={6}>No members yet.</td></tr>
              ) : (
                (usersQ.data ?? []).map((u) => (
                  <tr key={u.id} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-3">
                      <div className="font-medium">{u.full_name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{u.email ?? "—"}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Select value={u.plan} onValueChange={(v) => planM.mutate({ userId: u.id, plan: v })}>
                        <SelectTrigger className="h-8 w-28"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["free", "starter", "pro", "agency"].map((p) => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3">{u.credits}</td>
                    <td className="px-4 py-3 font-mono text-xs">{u.referral_code}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={u.roles.includes("admin") ? "default" : "secondary"}>
                          {u.roles.includes("admin") ? "admin" : "user"}
                        </Badge>
                        <Select
                          value={u.roles.includes("admin") ? "admin" : "user"}
                          onValueChange={(v) =>
                            roleM.mutate({ userId: u.id, role: v as "admin" | "user" })
                          }
                        >
                          <SelectTrigger className="h-8 w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">user</SelectItem>
                            <SelectItem value="admin">admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Input
                          className="h-8 w-24"
                          placeholder="+50"
                          value={creditDraft[u.id] ?? ""}
                          onChange={(e) => setCreditDraft((d) => ({ ...d, [u.id]: e.target.value }))}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const amount = Number(creditDraft[u.id]);
                            if (!amount) return toast.error("Enter a non-zero amount");
                            creditsM.mutate({ userId: u.id, amount, reason: "admin adjustment" });
                            setCreditDraft((d) => ({ ...d, [u.id]: "" }));
                          }}
                        >
                          Apply
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-xl font-bold">Audit log</h2>
        <p className="mt-1 text-sm text-muted-foreground">Role changes and admin actions, newest first.</p>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Target</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody>
              {(auditQ.data ?? []).length === 0 ? (
                <tr><td className="px-4 py-6 text-muted-foreground" colSpan={5}>No admin activity recorded yet.</td></tr>
              ) : (
                (auditQ.data ?? []).map((e) => (
                  <tr key={e.id} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(e.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">{e.actor_email ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs">{e.action}</td>
                    <td className="px-4 py-3">{e.target_email ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {e.details ?? "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </Shell>
  );
}

function StatCard({ label, value }: { label: string; value?: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1.5 font-display text-2xl font-bold">{value ?? "—"}</p>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto max-w-6xl px-5 py-10">{children}</main>;
}
