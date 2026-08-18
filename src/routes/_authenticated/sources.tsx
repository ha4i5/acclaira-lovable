import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

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
import { addSource, deleteSource, listSources, readLink, readSource, type FeedItem } from "@/lib/sources.functions";

export const Route = createFileRoute("/_authenticated/sources")({
  component: SourcesPage,
  head: () => ({
    meta: [
      { title: "News sources — Acclaira" },
      { name: "description", content: "Connect RSS feeds, news links and pages so Acclaira can pull fresh headlines into your content pipeline." },
      { property: "og:title", content: "News sources — Acclaira" },
      { property: "og:description", content: "Connect RSS feeds and news links to feed the Acclaira content pipeline." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function SourcesPage() {
  const qc = useQueryClient();
  const list = useServerFn(listSources);
  const add = useServerFn(addSource);
  const remove = useServerFn(deleteSource);
  const read = useServerFn(readSource);
  const readOne = useServerFn(readLink);

  const [label, setLabel] = useState("");
  const [kind, setKind] = useState("rss");
  const [url, setUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [items, setItems] = useState<FeedItem[]>([]);
  const [openSource, setOpenSource] = useState<string | null>(null);

  const sourcesQ = useQuery({ queryKey: ["sources"], queryFn: () => list() });

  const addM = useMutation({
    mutationFn: () => add({ data: { label, kind, url } }),
    onSuccess: () => {
      setLabel("");
      setUrl("");
      toast.success("Source saved");
      qc.invalidateQueries({ queryKey: ["sources"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeM = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Source removed");
      qc.invalidateQueries({ queryKey: ["sources"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const readM = useMutation({
    mutationFn: (id: string) => read({ data: { id } }),
    onSuccess: (data, id) => {
      setItems(data);
      setOpenSource(id);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const linkM = useMutation({
    mutationFn: () => readOne({ data: { url: linkUrl } }),
    onSuccess: (data) => {
      setItems([{ title: data.headline, link: data.source_url, published: null, summary: data.summary }]);
      setOpenSource(null);
      toast.success("Link analysed");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <header className="mb-8">
        <h1 className="font-display text-3xl text-foreground">News sources</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Feed the newsroom. Save RSS feeds and pages once, then pull fresh headlines whenever you generate.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <section className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold text-foreground">Add a source</h2>
            <div className="mt-4 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="src-label">Label</Label>
                <Input id="src-label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Geo News — Top stories" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="src-kind">Type</Label>
                <Select value={kind} onValueChange={setKind}>
                  <SelectTrigger id="src-kind">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rss">RSS feed</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="facebook">Facebook page</SelectItem>
                    <SelectItem value="instagram">Instagram profile</SelectItem>
                    <SelectItem value="link">Single link</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="src-url">URL</Label>
                <Input id="src-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/feed" />
              </div>
              <Button onClick={() => addM.mutate()} disabled={addM.isPending} className="w-full">
                {addM.isPending ? "Saving…" : "Save source"}
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold text-foreground">Analyse one link</h2>
            <p className="mt-1 text-xs text-muted-foreground">Paste any news URL to extract a clean headline and summary.</p>
            <div className="mt-3 flex gap-2">
              <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://…" />
              <Button variant="secondary" onClick={() => linkM.mutate()} disabled={linkM.isPending}>
                {linkM.isPending ? "Reading…" : "Read"}
              </Button>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold text-foreground">Saved sources</h2>
            {sourcesQ.isLoading ? (
              <p className="mt-3 text-sm text-muted-foreground">Loading…</p>
            ) : (sourcesQ.data?.length ?? 0) === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No sources yet. Add your first feed on the left.</p>
            ) : (
              <ul className="mt-3 divide-y divide-border">
                {sourcesQ.data?.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{s.label}</p>
                      <p className="truncate text-xs text-muted-foreground">{s.kind} · {s.url}</p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button size="sm" variant="outline" onClick={() => readM.mutate(s.id)} disabled={readM.isPending}>
                        {readM.isPending && openSource === s.id ? "…" : "Fetch"}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => removeM.mutate(s.id)}>
                        Remove
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold text-foreground">Latest headlines</h2>
            {items.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">Fetch a source or analyse a link to see headlines here.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {items.map((item, i) => (
                  <li key={`${item.link}-${i}`} className="rounded-lg border border-border/70 p-3">
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    {item.summary ? <p className="mt-1 text-xs text-muted-foreground">{item.summary}</p> : null}
                    <div className="mt-2 flex items-center gap-3">
                      <a href={item.link} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">
                        Open source
                      </a>
                      <button
                        type="button"
                        className="text-xs text-primary hover:underline"
                        onClick={() => {
                          void navigator.clipboard.writeText(item.title);
                          toast.success("Headline copied — paste it into the Studio");
                        }}
                      >
                        Copy headline
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
