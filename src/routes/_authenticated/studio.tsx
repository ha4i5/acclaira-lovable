import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { ThumbnailCanvas } from "@/components/ThumbnailCanvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { Generation, ModuleKey, Rate } from "@/lib/studio.functions";
import { generate, listGenerations, listRates, myProfile } from "@/lib/studio.functions";

export const Route = createFileRoute("/_authenticated/studio")({
  head: () => ({
    meta: [
      { title: "Studio — Acclaira" },
      { name: "description", content: "Generate viral news posts, SEO articles and Urdu video scripts." },
      { property: "og:title", content: "Studio — Acclaira" },
      { property: "og:description", content: "One headline. Post. Article. Video." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StudioPage,
});

const MODULES: { key: ModuleKey; label: string; blurb: string }[] = [
  { key: "post", label: "Viral post", blurb: "Thumbnail, caption and hashtags in 3 aspect ratios." },
  { key: "article", label: "SEO article", blurb: "~350 words, meta description and keywords." },
  { key: "video", label: "Urdu video", blurb: "60-second Nastaliq script with scene breakdown." },
];

function StudioPage() {
  const runGenerate = useServerFn(generate);
  const fetchRates = useServerFn(listRates);
  const fetchHistory = useServerFn(listGenerations);
  const fetchProfile = useServerFn(myProfile);
  const qc = useQueryClient();

  const [moduleKey, setModuleKey] = useState<ModuleKey>("post");
  const [headline, setHeadline] = useState("");
  const [language, setLanguage] = useState("roman-urdu");
  const [handle, setHandle] = useState("@acclaira");
  const [result, setResult] = useState<Record<string, any> | null>(null);

  const ratesQ = useQuery({ queryKey: ["rates"], queryFn: () => fetchRates() as Promise<Rate[]> });
  const profileQ = useQuery({ queryKey: ["my-profile"], queryFn: () => fetchProfile() });
  const historyQ = useQuery({
    queryKey: ["generations"],
    queryFn: () => fetchHistory() as Promise<Generation[]>,
  });

  const cost = ratesQ.data?.find((r) => r.module_key === moduleKey)?.credits ?? 1;

  const genM = useMutation({
    mutationFn: () => runGenerate({ data: { moduleKey, headline, language } }),
    onSuccess: (res: any) => {
      setResult(JSON.parse(res.output));
      toast.success(`Done — ${res.credits_used} credit(s) used`);
      qc.invalidateQueries({ queryKey: ["generations"] });
      qc.invalidateQueries({ queryKey: ["my-profile"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (e: Error) => {
      const msg = e.message.includes("INSUFFICIENT_CREDITS")
        ? "Not enough credits for this module."
        : e.message.includes("RATE_LIMIT")
          ? "Rate limited — try again in a moment."
          : "Generation failed. Your credits were refunded.";
      toast.error(msg);
    },
  });

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Studio</h1>
          <p className="mt-1.5 text-muted-foreground">One headline. Post. Article. Video.</p>
        </div>
        <div className="rounded-xl border border-border bg-card px-4 py-2 text-sm">
          <span className="text-muted-foreground">Credits</span>{" "}
          <span className="font-display font-bold">{(profileQ.data as any)?.credits ?? "—"}</span>
        </div>
      </div>

      <Tabs value={moduleKey} onValueChange={(v) => { setModuleKey(v as ModuleKey); setResult(null); }} className="mt-8">
        <TabsList>
          {MODULES.map((m) => (
            <TabsTrigger key={m.key} value={m.key}>
              {m.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {MODULES.map((m) => (
          <TabsContent key={m.key} value={m.key} className="mt-6">
            <p className="text-sm text-muted-foreground">{m.blurb}</p>
          </TabsContent>
        ))}
      </Tabs>

      <div className="mt-4 grid gap-4 rounded-2xl border border-border bg-card p-6 sm:grid-cols-[1fr_180px_auto] sm:items-end">
        <div>
          <Label htmlFor="headline">Headline</Label>
          <Input
            id="headline"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="Paste or type a news headline"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label>Language</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="roman-urdu">Roman Urdu</SelectItem>
              <SelectItem value="english">English</SelectItem>
              <SelectItem value="urdu">Urdu</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => genM.mutate()} disabled={genM.isPending || headline.trim().length < 6}>
          {genM.isPending ? "Generating…" : `Generate · ${cost} credit${cost === 1 ? "" : "s"}`}
        </Button>
      </div>

      {result ? (
        <section className="mt-8">
          {moduleKey === "post" ? (
            <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
              <div className="rounded-2xl border border-border bg-card p-6">
                <Field label="Thumbnail title" value={result.thumbnail_title} />
                <Field label="Subtitle" value={result.subtitle} />
                <Field label="Caption" value={result.caption} />
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Hashtags</p>
                  <p className="mt-1 text-sm">
                    {(result.hashtags ?? []).map((h: string) => `#${h}`).join(" ")}
                  </p>
                </div>
                <div className="mt-4">
                  <Label htmlFor="handle">Brand handle</Label>
                  <Input id="handle" value={handle} onChange={(e) => setHandle(e.target.value)} className="mt-1.5" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {(["1:1", "16:9", "9:16"] as const).map((r) => (
                  <ThumbnailCanvas
                    key={r}
                    ratio={r}
                    title={String(result.thumbnail_title ?? headline)}
                    subtitle={String(result.subtitle ?? "")}
                    handle={handle}
                    accent="#3EC3AC"
                  />
                ))}
              </div>
            </div>
          ) : moduleKey === "article" ? (
            <div className="rounded-2xl border border-border bg-card p-6">
              <Field label="SEO title" value={result.title} />
              <Field label="Meta description" value={result.meta_description} />
              <Field label="Slug" value={result.slug} />
              <Field label="Keywords" value={(result.keywords ?? []).join(", ")} />
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Article</p>
              <pre className="mt-1 whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {String(result.body_markdown ?? "")}
              </pre>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-6">
              <Field label="Title" value={result.title} />
              <Field label="Hook" value={result.hook} />
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Urdu script</p>
              <p dir="rtl" className="mt-1 text-lg leading-loose">{String(result.script_urdu ?? "")}</p>
              <Field label="Roman Urdu" value={result.script_roman} />
              <div className="mt-4 space-y-2">
                {(result.scenes ?? []).map((s: any, i: number) => (
                  <div key={i} className="rounded-lg border border-border p-3 text-sm">
                    <span className="font-mono text-xs text-muted-foreground">{s.t}</span>
                    <p className="mt-1 font-medium">{s.visual}</p>
                    <p className="text-muted-foreground">{s.vo}</p>
                  </div>
                ))}
              </div>
              <Field label="Call to action" value={result.cta} />
            </div>
          )}
        </section>
      ) : null}

      <section className="mt-12">
        <h2 className="font-display text-xl font-bold">Recent generations</h2>
        <div className="mt-4 space-y-2">
          {(historyQ.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing generated yet.</p>
          ) : (
            (historyQ.data ?? []).map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => {
                  setModuleKey(g.module_key as ModuleKey);
                  setHeadline(g.headline);
                  setResult(JSON.parse(g.output));
                }}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-left text-sm hover:bg-muted"
              >
                <span className="truncate">{g.headline}</span>
                <span className="ml-4 shrink-0 text-xs text-muted-foreground">
                  {g.module_key} · {g.credits_used} cr · {new Date(g.created_at).toLocaleDateString()}
                </span>
              </button>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

function Field({ label, value }: { label: string; value: unknown }) {
  if (!value) return null;
  return (
    <div className="mt-4 first:mt-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm leading-relaxed">{String(value)}</p>
    </div>
  );
}
