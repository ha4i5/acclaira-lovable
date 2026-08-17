import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type ModuleKey = "post" | "article" | "video";

export type Rate = { module_key: string; label: string; credits: number };

export const listRates = createServerFn({ method: "GET" }).handler(async (): Promise<Rate[]> => {
  const { createClient } = await import("@supabase/supabase-js");
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const client = createClient(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
  const { data } = await client.from("module_rates").select("module_key, label, credits").order("credits");
  return (data ?? []) as Rate[];
});

export type Generation = {
  id: string;
  module_key: string;
  headline: string;
  language: string;
  output: string;
  credits_used: number;
  source: string;
  created_at: string;
};

export const generate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { moduleKey: ModuleKey; headline: string; language: string }) => {
    const allowed: ModuleKey[] = ["post", "article", "video"];
    if (!allowed.includes(input?.moduleKey)) throw new Error("Unknown module");
    const headline = (input.headline ?? "").trim();
    if (headline.length < 6 || headline.length > 300) throw new Error("Headline must be 6-300 characters");
    const language = ["english", "roman-urdu", "urdu"].includes(input.language) ? input.language : "english";
    return { moduleKey: input.moduleKey, headline, language };
  })
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { runGeneration } = await import("./generation.server");
    return runGeneration(supabaseAdmin, context.userId, data, "app");
  });

export const listGenerations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Generation[]> => {
    const { data } = await context.supabase
      .from("generations")
      .select("id, module_key, headline, language, output, credits_used, source, created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(50);
    return (data ?? []).map((g) => ({ ...g, output: JSON.stringify(g.output ?? {}) }));
  });

export type Txn = {
  id: string;
  amount: number;
  balance_after: number;
  reason: string;
  module_key: string | null;
  created_at: string;
};

export const listTransactions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Txn[]> => {
    const { data } = await context.supabase
      .from("credit_transactions")
      .select("id, amount, balance_after, reason, module_key, created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(100);
    return (data ?? []) as Txn[];
  });

export const myProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("profiles")
      .select("full_name, email, plan, credits, referral_code")
      .eq("id", context.userId)
      .maybeSingle();
    return data ?? null;
  });
