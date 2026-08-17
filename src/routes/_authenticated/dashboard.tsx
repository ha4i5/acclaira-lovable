import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Acclaira" },
      { name: "description", content: "Your Acclaira newsroom: credits, plan and modules." },
      { property: "og:title", content: "Dashboard — Acclaira" },
      { property: "og:description", content: "Your Acclaira newsroom dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

type Profile = {
  full_name: string | null;
  plan: string;
  credits: number;
  referral_code: string;
};

const MODULES = [
  { n: 1, title: "Viral news post", cost: "1 credit", desc: "Headline to thumbnail + caption in seconds." },
  { n: 2, title: "SEO article", cost: "4 credits", desc: "Long-form, structured, search-ready copy." },
  { n: 3, title: "Urdu video script", cost: "10 credits", desc: "Rendered script for short-form video." },
];

function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name, plan, credits, referral_code")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => setProfile(data));
  }, [user]);

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <h1 className="font-display text-3xl font-bold">
        Welcome back{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}.
      </h1>
      <p className="mt-1.5 text-muted-foreground">One headline. Post. Article. Video.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Credits" value={profile ? String(profile.credits) : "—"} />
        <Stat label="Plan" value={profile ? profile.plan : "—"} />
        <Stat label="Referral code" value={profile ? profile.referral_code : "—"} />
      </div>

      <h2 className="mt-12 font-display text-xl font-bold">Modules</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {MODULES.map((m) => (
          <div key={m.n} className="rounded-2xl border border-border bg-card p-6">
            <span className="text-xs font-semibold uppercase tracking-wide text-accent-foreground">
              Module {m.n} · {m.cost}
            </span>
            <h3 className="mt-2 font-display text-lg font-bold">{m.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{m.desc}</p>
            <p className="mt-4 text-xs text-muted-foreground">Generation coming in the next phase.</p>
          </div>
        ))}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1.5 font-display text-2xl font-bold capitalize">{value}</p>
    </div>
  );
}
