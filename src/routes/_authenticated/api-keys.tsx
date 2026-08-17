import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ApiKeyRow } from "@/lib/keys.functions";
import { createApiKey, listApiKeys, revokeApiKey } from "@/lib/keys.functions";

export const Route = createFileRoute("/_authenticated/api-keys")({
  head: () => ({
    meta: [
      { title: "API keys — Acclaira" },
      { name: "description", content: "Create and revoke Acclaira developer API keys." },
      { property: "og:title", content: "API keys — Acclaira" },
      { property: "og:description", content: "Manage your Acclaira REST API v1 keys." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ApiKeysPage,
});

function ApiKeysPage() {
  const fetchKeys = useServerFn(listApiKeys);
  const createKey = useServerFn(createApiKey);
  const revokeKey = useServerFn(revokeApiKey);
  const qc = useQueryClient();

  const [name, setName] = useState("");
  const [secret, setSecret] = useState<string | null>(null);

  const keysQ = useQuery({ queryKey: ["api-keys"], queryFn: () => fetchKeys() as Promise<ApiKeyRow[]> });

  const createM = useMutation({
    mutationFn: () => createKey({ data: { name } }),
    onSuccess: (res: any) => {
      setSecret(res.secret);
      setName("");
      qc.invalidateQueries({ queryKey: ["api-keys"] });
    },
    onError: () => toast.error("Could not create key"),
  });

  const revokeM = useMutation({
    mutationFn: (id: string) => revokeKey({ data: { id } }),
    onSuccess: () => {
      toast.success("Key revoked");
      qc.invalidateQueries({ queryKey: ["api-keys"] });
    },
  });

  return (
    <main className="mx-auto max-w-4xl px-5 py-10">
      <h1 className="font-display text-3xl font-bold">API keys</h1>
      <p className="mt-1.5 text-muted-foreground">
        Use these with the <Link to="/docs" className="underline">REST API v1</Link>. Keys are shown once.
      </p>

      <div className="mt-8 flex flex-wrap gap-3 rounded-2xl border border-border bg-card p-6">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Key name (e.g. newsroom-bot)"
          className="max-w-xs"
        />
        <Button onClick={() => createM.mutate()} disabled={createM.isPending || name.trim().length < 2}>
          {createM.isPending ? "Creating…" : "Create key"}
        </Button>
      </div>

      {secret ? (
        <div className="mt-4 rounded-2xl border border-primary/40 bg-primary/5 p-5">
          <p className="text-sm font-medium">Copy this key now — it will not be shown again.</p>
          <code className="mt-2 block break-all rounded-lg bg-background px-3 py-2 font-mono text-sm">{secret}</code>
          <Button
            size="sm"
            variant="outline"
            className="mt-3"
            onClick={() => {
              navigator.clipboard.writeText(secret);
              toast.success("Copied");
            }}
          >
            Copy
          </Button>
        </div>
      ) : null}

      <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Prefix</th>
              <th className="px-4 py-3">Last used</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(keysQ.data ?? []).length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-6 text-muted-foreground">No keys yet.</td></tr>
            ) : (
              (keysQ.data ?? []).map((k) => (
                <tr key={k.id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3 font-medium">{k.name}</td>
                  <td className="px-4 py-3 font-mono text-xs">{k.key_prefix}…</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {k.last_used_at ? new Date(k.last_used_at).toLocaleString() : "never"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={k.revoked ? "secondary" : "default"}>{k.revoked ? "revoked" : "active"}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!k.revoked && (
                      <Button size="sm" variant="outline" onClick={() => revokeM.mutate(k.id)}>
                        Revoke
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
