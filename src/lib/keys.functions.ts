import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type ApiKeyRow = {
  id: string;
  name: string;
  key_prefix: string;
  revoked: boolean;
  last_used_at: string | null;
  created_at: string;
};

export const listApiKeys = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ApiKeyRow[]> => {
    const { data } = await context.supabase
      .from("api_keys")
      .select("id, name, key_prefix, revoked, last_used_at, created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    return (data ?? []) as ApiKeyRow[];
  });

export const createApiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { name: string }) => {
    const name = (input?.name ?? "").trim();
    if (name.length < 2 || name.length > 60) throw new Error("Name must be 2-60 characters");
    return { name };
  })
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { generateApiKey, hashApiKey } = await import("./apikeys.server");

    const secret = generateApiKey();
    const hash = await hashApiKey(secret);

    const { error } = await supabaseAdmin.from("api_keys").insert({
      user_id: context.userId,
      name: data.name,
      key_prefix: secret.slice(0, 12),
      key_hash: hash,
    });
    if (error) throw new Error(error.message);

    return { secret };
  });

export const revokeApiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => {
    if (!input?.id) throw new Error("Missing key id");
    return { id: input.id };
  })
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("api_keys")
      .update({ revoked: true })
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
