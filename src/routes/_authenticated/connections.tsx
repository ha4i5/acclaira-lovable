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
import { deleteConnection, listConnections, saveConnection } from "@/lib/connections.functions";
import { listPublishJobs } from "@/lib/publish.functions";

export const Route = createFileRoute("/_authenticated/connections")({
  component: ConnectionsPage,
  head: () => ({
    meta: [
      { title: "Publishing channels — Acclaira" },
      { name: "description", content: "Connect Facebook Pages, Instagram accounts and WordPress sites so Acclaira can publish your generated content." },
      { property: "og:title", content: "Publishing channels — Acclaira" },
      { property: "og:description", content: "Connect Facebook, Instagram and WordPress publishing targets." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function ConnectionsPage() {
  const qc = useQueryClient();
  const list = useServerFn(listConnections);
  const save = useServerFn(saveConnection);
  const remove = useServerFn(deleteConnection);
  const jobs = useServerFn(listPublishJobs);

  const [platform, setPlatform] = useState("wordpress");
  const [label, setLabel] = useState("");
  const [externalId, setExternalId] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [username, setUsername] = useState("");
  const [secret, setSecret] = useState("");

  const connQ = useQuery({ queryKey: ["connections"], queryFn: () => list() });
  const jobsQ = useQuery({ queryKey: ["publish-jobs"], queryFn: () => jobs() });

  const saveM = useMutation({
    mutationFn: () => save({ data: { platform, label, externalId, secret, siteUrl, username } }),
    onSuccess: () => {
      setLabel("");
      setExternalId("");
      setSiteUrl("");
      setUsername("");
      setSecret("");
      toast.success("Channel connected");
      qc.invalidateQueries({ queryKey: ["connections"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeM = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Channel removed");
      qc.invalidateQueries({ queryKey: ["connections"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const isWordPress = platform === "wordpress";

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <header className="mb-8">
        <h1 className="font-display text-3xl text-foreground">Publishing channels</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Where your content goes live. Credentials are stored server-side and can never be read back in the browser.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground">Connect a channel</h2>
          <div className="mt-4 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="platform">Platform</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger id="platform">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wordpress">WordPress site</SelectItem>
                  <SelectItem value="facebook">Facebook Page</SelectItem>
                  <SelectItem value="instagram">Instagram business account</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="label">Label</Label>
              <Input id="label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Main news site" />
            </div>

            {isWordPress ? (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="site">Site URL</Label>
                  <Input id="site" value={siteUrl} onChange={(e) => setSiteUrl(e.target.value)} placeholder="https://yoursite.com" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="user">WordPress username</Label>
                  <Input id="user" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="editor" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="secret">Application password</Label>
                  <Input id="secret" type="password" value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="xxxx xxxx xxxx xxxx" />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="ext">{platform === "facebook" ? "Page ID" : "Instagram account ID"}</Label>
                  <Input id="ext" value={externalId} onChange={(e) => setExternalId(e.target.value)} placeholder="1234567890" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="secret">Page access token</Label>
                  <Input id="secret" type="password" value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="EAAB…" />
                </div>
              </>
            )}

            <Button onClick={() => saveM.mutate()} disabled={saveM.isPending} className="w-full">
              {saveM.isPending ? "Connecting…" : "Connect channel"}
            </Button>
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold text-foreground">Connected</h2>
            {connQ.isLoading ? (
              <p className="mt-3 text-sm text-muted-foreground">Loading…</p>
            ) : (connQ.data?.length ?? 0) === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No channels yet.</p>
            ) : (
              <ul className="mt-3 divide-y divide-border">
                {connQ.data?.map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{c.label}</p>
                      <p className="truncate text-xs text-muted-foreground">{c.platform} · {c.external_id}</p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => removeM.mutate(c.id)}>
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold text-foreground">Recent publishes</h2>
            {(jobsQ.data?.length ?? 0) === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">Nothing published yet.</p>
            ) : (
              <ul className="mt-3 divide-y divide-border">
                {jobsQ.data?.map((j) => (
                  <li key={j.id} className="py-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-foreground">{j.target ?? j.platform}</span>
                      <span className={j.status === "success" ? "text-xs text-primary" : "text-xs text-destructive"}>
                        {j.status}
                      </span>
                    </div>
                    {j.post_url ? (
                      <a href={j.post_url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">
                        {j.post_url}
                      </a>
                    ) : null}
                    {j.error ? <p className="text-xs text-destructive">{j.error}</p> : null}
                    <p className="text-xs text-muted-foreground">{new Date(j.created_at).toLocaleString()}</p>
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
