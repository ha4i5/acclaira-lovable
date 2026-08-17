import { createFileRoute } from "@tanstack/react-router";

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "authorization, x-api-key, content-type",
  "access-control-max-age": "86400",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store", ...CORS },
  });
}

export const Route = createFileRoute("/api/public/v1/generate")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        const header = request.headers.get("authorization");
        const presented =
          request.headers.get("x-api-key") ??
          (header?.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : null);
        if (!presented) return json({ error: "Missing API key" }, 401);

        const { hashApiKey } = await import("@/lib/apikeys.server");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const hash = await hashApiKey(presented);
        const { data: keyRow } = await supabaseAdmin
          .from("api_keys")
          .select("id, user_id, revoked")
          .eq("key_hash", hash)
          .maybeSingle();
        if (!keyRow || keyRow.revoked) return json({ error: "Invalid API key" }, 401);

        let body: { module?: string; headline?: string; language?: string };
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return json({ error: "Invalid JSON body" }, 400);
        }

        const moduleKey = body.module;
        if (moduleKey !== "post" && moduleKey !== "article" && moduleKey !== "video") {
          return json({ error: "module must be one of: post, article, video" }, 400);
        }
        const headline = (body.headline ?? "").trim();
        if (headline.length < 6 || headline.length > 300) {
          return json({ error: "headline must be 6-300 characters" }, 400);
        }
        const language = ["english", "roman-urdu", "urdu"].includes(body.language ?? "")
          ? (body.language as string)
          : "english";

        await supabaseAdmin
          .from("api_keys")
          .update({ last_used_at: new Date().toISOString() })
          .eq("id", keyRow.id);

        try {
          const { runGeneration } = await import("@/lib/generation.server");
          const result = await runGeneration(
            supabaseAdmin,
            keyRow.user_id,
            { moduleKey, headline, language },
            "api",
          );
          return json({
            id: result.id,
            module: result.module_key,
            credits_used: result.credits_used,
            created_at: result.created_at,
            output: JSON.parse(result.output),
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Generation failed";
          if (message === "INSUFFICIENT_CREDITS") return json({ error: "Insufficient credits" }, 402);
          if (message === "RATE_LIMIT") return json({ error: "Rate limited, try again shortly" }, 429);
          return json({ error: "Generation failed, credits refunded" }, 502);
        }
      },
    },
  },
});
