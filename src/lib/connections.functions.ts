import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type Connection = {
  id: string;
  platform: string;
  label: string;
  external_id: string | null;
  active: boolean;
  created_at: string;
};

const PLATFORMS = ["facebook", "instagram", "wordpress"];

export const listConnections = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Connection[]> => {
    const { data } = await context.supabase
      .from("social_connections")
      .select("id, platform, label, external_id, active, created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    return (data ?? []) as Connection[];
  });

/**
 * Saves a publishing target. The credential (page access token or WordPress
 * application password) is written through the service-role client into a
 * column the browser can never read back.
 */
export const saveConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    platform: string;
    label: string;
    externalId: string;
    secret: string;
    siteUrl?: string;
    username?: string;
  }) => {
    if (!PLATFORMS.includes(input?.platform)) throw new Error("Unsupported platform");
    const label = (input.label ?? "").trim();
    if (label.length < 2 || label.length > 80) throw new Error("Label must be 2-80 characters");
    const secret = (input.secret ?? "").trim();
    if (secret.length < 8) throw new Error("Credential looks too short");

    if (input.platform === "wordpress") {
      const siteUrl = (input.siteUrl ?? "").trim().replace(/\/+$/, "");
      const username = (input.username ?? "").trim();
      if (!/^https:\/\/\S+$/i.test(siteUrl)) throw new Error("WordPress site URL must start with https://");
      if (!username) throw new Error("WordPress username is required");
      return { platform: "wordpress", label, externalId: siteUrl, secret, siteUrl, username };
    }

    const externalId = (input.externalId ?? "").trim();
    if (!/^\d{5,}$/.test(externalId)) throw new Error("Enter the numeric Page or Instagram account ID");
    return { platform: input.platform, label, externalId, secret, siteUrl: "", username: "" };
  })
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("social_connections").insert({
      user_id: context.userId,
      platform: data.platform,
      label: data.label,
      external_id: data.externalId,
      secret: data.secret,
      config: data.platform === "wordpress" ? { site_url: data.siteUrl, username: data.username } : {},
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => {
    if (!input?.id) throw new Error("Missing connection");
    return { id: input.id };
  })
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("social_connections")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
