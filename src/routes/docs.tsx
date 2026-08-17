import { createFileRoute, Link } from "@tanstack/react-router";

import { MarketingShell } from "@/components/MarketingShell";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Acclaira API v1 — developer documentation" },
      {
        name: "description",
        content:
          "Acclaira REST API v1: Bearer/X-API-Key auth, the /api/public/v1/generate endpoint, credit costs, error codes and SDK snippets.",
      },
      { property: "og:title", content: "Acclaira API v1 — developer documentation" },
      {
        property: "og:description",
        content: "Generate viral posts, SEO articles and Urdu video scripts from your own frontend.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DocsPage,
});

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "auth", label: "Authentication" },
  { id: "generate", label: "POST /v1/generate" },
  { id: "modules", label: "Modules & credits" },
  { id: "errors", label: "Errors" },
  { id: "sdk", label: "SDK snippets" },
  { id: "architecture", label: "Architecture" },
];

const SNIPPETS: { label: string; code: string }[] = [
  {
    label: "cURL",
    code: `curl -X POST https://acclaira.com/api/public/v1/generate \\
  -H "X-API-Key: acc_live_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{"module":"post","headline":"Karachi weather alert issued","language":"roman-urdu"}'`,
  },
  {
    label: "JavaScript (fetch)",
    code: `const res = await fetch("/api/public/v1/generate", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": process.env.ACCLAIRA_KEY,
  },
  body: JSON.stringify({
    module: "article",
    headline: "Karachi weather alert issued",
    language: "english",
  }),
});
const data = await res.json();`,
  },
  {
    label: "React hook",
    code: `export function useAcclaira() {
  return async (module, headline, language = "english") => {
    const res = await fetch("/api/public/v1/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": KEY },
      body: JSON.stringify({ module, headline, language }),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  };
}`,
  },
  {
    label: "Python",
    code: `import requests

res = requests.post(
    "https://acclaira.com/api/public/v1/generate",
    headers={"X-API-Key": KEY},
    json={"module": "video", "headline": "Karachi weather alert issued", "language": "urdu"},
    timeout=60,
)
res.raise_for_status()
print(res.json()["output"])`,
  },
];

function DocsPage() {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-6xl px-5 py-14">
        <header className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Developer platform</p>
          <h1 className="mt-2 font-display text-4xl font-bold">Acclaira API v1</h1>
          <p className="mt-3 text-muted-foreground">
            One endpoint turns a headline into a viral post, an SEO article or a 60-second Urdu video script.
            Authenticate with a key from your dashboard and call it from any frontend or backend.
          </p>
          <Link to="/api-keys" className="mt-4 inline-block text-sm font-medium text-primary underline">
            Create an API key →
          </Link>
        </header>

        <div className="mt-12 grid gap-10 lg:grid-cols-[200px_1fr]">
          <nav className="hidden lg:block">
            <ul className="sticky top-24 space-y-2 text-sm">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-muted-foreground hover:text-primary">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="min-w-0 space-y-14">
            <Section id="overview" title="Overview">
              <p>
                The API is served from <Code>/api/public/v1/*</Code> and speaks JSON over HTTPS. CORS preflight is
                supported, so you can call it directly from a browser app. Every successful generation deducts credits
                from the key owner's balance and is written to the same ledger and history you see in the app.
              </p>
              <Table
                head={["Base URL", "Format", "Auth"]}
                rows={[["/api/public/v1", "application/json", "Bearer token or X-API-Key"]]}
              />
            </Section>

            <Section id="auth" title="Authentication">
              <p>
                Send your key in either header. Keys are generated in the dashboard, stored only as a SHA-256 hash, and
                can be revoked at any time.
              </p>
              <Pre>{`Authorization: Bearer acc_live_xxx
# or
X-API-Key: acc_live_xxx`}</Pre>
              <p className="text-sm text-muted-foreground">
                A revoked or unknown key returns <Code>401</Code>. Keys record their last use so you can spot stale
                integrations.
              </p>
            </Section>

            <Section id="generate" title="POST /api/public/v1/generate">
              <Table
                head={["Field", "Type", "Required", "Notes"]}
                rows={[
                  ["module", "string", "yes", "post | article | video"],
                  ["headline", "string", "yes", "6-300 characters"],
                  ["language", "string", "no", "english | roman-urdu | urdu (default english)"],
                ]}
              />
              <p className="mt-4 font-medium">Response</p>
              <Pre>{`{
  "id": "8f0c…",
  "module": "post",
  "credits_used": 1,
  "created_at": "2026-08-18T04:20:00.000Z",
  "output": {
    "thumbnail_title": "KARACHI WEATHER ALERT ISSUED",
    "subtitle": "Heavy rain expected for 48 hours",
    "caption": "…",
    "hashtags": ["Karachi", "Weather", "…"],
    "alt_text": "…"
  }
}`}</Pre>
            </Section>

            <Section id="modules" title="Modules & credits">
              <Table
                head={["Module", "Output", "Credits"]}
                rows={[
                  ["post", "Thumbnail title, subtitle, caption, hashtags, alt text (3 aspect ratios rendered in-app)", "1"],
                  ["article", "SEO title, meta description, slug, ~350-word body, keywords, image prompt", "4"],
                  ["video", "60-second Urdu Nastaliq script, Roman Urdu, scene breakdown, hook and CTA", "10"],
                ]}
              />
              <p className="text-sm text-muted-foreground">
                Rates are live values set by the admin pricing editor — read the current numbers on your{" "}
                <Link to="/credits" className="underline">credits page</Link>. If generation fails upstream, credits are
                refunded automatically and the refund appears in the ledger.
              </p>
            </Section>

            <Section id="errors" title="Errors">
              <Table
                head={["Status", "Meaning"]}
                rows={[
                  ["400", "Invalid JSON body, unknown module, or headline outside 6-300 characters"],
                  ["401", "Missing, unknown or revoked API key"],
                  ["402", "Insufficient credits on the key owner's account"],
                  ["429", "Rate limited — retry with backoff"],
                  ["502", "Upstream generation failure; credits already refunded"],
                ]}
              />
            </Section>

            <Section id="sdk" title="SDK snippets">
              <div className="grid gap-4 md:grid-cols-2">
                {SNIPPETS.map((s) => (
                  <div key={s.label}>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {s.label}
                    </p>
                    <Pre>{s.code}</Pre>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="architecture" title="Architecture">
              <Table
                head={["Layer", "Implementation"]}
                rows={[
                  ["Frontend & routing", "React 19 + TanStack Start, SSR with file-based routes"],
                  ["Server logic", "Typed server functions and public REST routes"],
                  ["Database", "Postgres with row-level security on every table"],
                  ["Auth", "Email/password and Google sign-in, role-based access control"],
                  ["Thumbnails", "HTML5 canvas engine, 1:1 / 16:9 / 9:16, PNG export"],
                  ["Credits", "Atomic ledger with auto-refund on upstream failure"],
                  ["Admin", "Role management, credit adjustments, pricing editor, audit log"],
                ]}
              />
            </Section>
          </div>
        </div>
      </div>
    </MarketingShell>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="font-display text-2xl font-bold">{title}</h2>
      <div className="mt-3 space-y-4 text-sm leading-relaxed text-foreground/90">{children}</div>
    </section>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{children}</code>;
}

function Pre({ children }: { children: React.ReactNode }) {
  return (
    <pre className="overflow-x-auto rounded-xl border border-border bg-card p-4 font-mono text-xs leading-relaxed">
      {children}
    </pre>
  );
}

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-4 py-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-border/60 last:border-0">
              {r.map((c, j) => (
                <td key={j} className="px-4 py-3 align-top">{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
