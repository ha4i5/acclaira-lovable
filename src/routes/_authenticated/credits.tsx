import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { Button } from "@/components/ui/button";
import type { Rate, Txn } from "@/lib/studio.functions";
import { listRates, listTransactions, myProfile } from "@/lib/studio.functions";

export const Route = createFileRoute("/_authenticated/credits")({
  head: () => ({
    meta: [
      { title: "Credits & billing — Acclaira" },
      { name: "description", content: "Your Acclaira credit balance and transaction ledger." },
      { property: "og:title", content: "Credits & billing — Acclaira" },
      { property: "og:description", content: "Credit balance, module rates and full ledger." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CreditsPage,
});

function CreditsPage() {
  const fetchTx = useServerFn(listTransactions);
  const fetchRates = useServerFn(listRates);
  const fetchProfile = useServerFn(myProfile);

  const txQ = useQuery({ queryKey: ["transactions"], queryFn: () => fetchTx() as Promise<Txn[]> });
  const ratesQ = useQuery({ queryKey: ["rates"], queryFn: () => fetchRates() as Promise<Rate[]> });
  const profileQ = useQuery({ queryKey: ["my-profile"], queryFn: () => fetchProfile() });
  const profile = profileQ.data as { credits?: number; plan?: string } | null;

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <h1 className="font-display text-3xl font-bold">Credits & billing</h1>
      <p className="mt-1.5 text-muted-foreground">Every spend, refund and top-up, in order.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card label="Balance" value={profile?.credits != null ? String(profile.credits) : "—"} />
        <Card label="Plan" value={profile?.plan ?? "—"} />
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Top up</p>
          <Button asChild size="sm" className="mt-3">
            <Link to="/packages">View packages</Link>
          </Button>
        </div>
      </div>

      <h2 className="mt-10 font-display text-xl font-bold">Module rates</h2>
      <div className="mt-3 flex flex-wrap gap-3">
        {(ratesQ.data ?? []).map((r) => (
          <span key={r.module_key} className="rounded-full border border-border bg-card px-4 py-1.5 text-sm">
            {r.label} · <strong>{r.credits}</strong> credit{r.credits === 1 ? "" : "s"}
          </span>
        ))}
      </div>

      <h2 className="mt-10 font-display text-xl font-bold">Ledger</h2>
      <div className="mt-3 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3 text-right">Change</th>
              <th className="px-4 py-3 text-right">Balance</th>
            </tr>
          </thead>
          <tbody>
            {(txQ.data ?? []).length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-6 text-muted-foreground">No transactions yet.</td></tr>
            ) : (
              (txQ.data ?? []).map((t) => (
                <tr key={t.id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                    {new Date(t.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">{t.reason}</td>
                  <td className={`px-4 py-3 text-right font-medium ${t.amount < 0 ? "text-destructive" : "text-primary"}`}>
                    {t.amount > 0 ? `+${t.amount}` : t.amount}
                  </td>
                  <td className="px-4 py-3 text-right">{t.balance_after}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1.5 font-display text-2xl font-bold capitalize">{value}</p>
    </div>
  );
}
