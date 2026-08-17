import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Ctx = { supabase: any; userId: string; claims: Record<string, unknown> };

async function assertAdmin(context: Ctx) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error("Authorization check failed");
  if (!data) throw new Error("Forbidden");
}

export const isAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { isAdmin: Boolean(data) };
  });

export type AdminUser = {
  id: string;
  email: string | null;
  full_name: string | null;
  plan: string;
  credits: number;
  referral_code: string;
  suspended: boolean;
  created_at: string;
  roles: string[];
};

export const listUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminUser[]> => {
    await assertAdmin(context as Ctx);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: profiles, error } = await supabaseAdmin
      .from("profiles")
      .select("id, email, full_name, plan, credits, referral_code, suspended, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    const { data: roles } = await supabaseAdmin.from("user_roles").select("user_id, role");
    const byUser = new Map<string, string[]>();
    for (const r of roles ?? []) {
      byUser.set(r.user_id, [...(byUser.get(r.user_id) ?? []), r.role as string]);
    }

    return (profiles ?? []).map((p) => ({ ...p, roles: byUser.get(p.id) ?? [] }));
  });

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string; role: "admin" | "user" }) => {
    if (!input?.userId || (input.role !== "admin" && input.role !== "user")) {
      throw new Error("Invalid input");
    }
    return input;
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: before } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", data.userId);
    const previous = (before ?? []).map((r) => r.role as string);

    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId);
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: data.userId, role: data.role });
    if (error) throw new Error(error.message);

    const [{ data: actor }, { data: target }] = await Promise.all([
      supabaseAdmin.from("profiles").select("email").eq("id", context.userId).maybeSingle(),
      supabaseAdmin.from("profiles").select("email").eq("id", data.userId).maybeSingle(),
    ]);

    await supabaseAdmin.from("admin_audit_log").insert({
      actor_id: context.userId,
      actor_email: actor?.email ?? null,
      action: "role.change",
      target_user_id: data.userId,
      target_email: target?.email ?? null,
      details: { from: previous, to: [data.role] },
    });

    return { ok: true };
  });

export type AuditEntry = {
  id: string;
  actor_email: string | null;
  action: string;
  target_email: string | null;
  details: string | null;
  created_at: string;
};

export const listAuditLog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AuditEntry[]> => {
    await assertAdmin(context as Ctx);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("admin_audit_log")
      .select("id, actor_email, action, target_email, details, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return (data ?? []).map((e) => ({
      id: e.id,
      actor_email: e.actor_email,
      action: e.action,
      target_email: e.target_email,
      details: e.details ? JSON.stringify(e.details) : null,
      created_at: e.created_at,
    }));
  });

export const adjustCredits = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string; amount: number; reason: string }) => {
    if (!input?.userId) throw new Error("Missing user");
    const amount = Math.trunc(Number(input.amount));
    if (!Number.isFinite(amount) || amount === 0 || Math.abs(amount) > 100000) {
      throw new Error("Amount must be a non-zero integer up to 100000");
    }
    return { userId: input.userId, amount, reason: (input.reason ?? "admin adjustment").slice(0, 200) };
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (data.amount > 0) {
      const { error } = await supabaseAdmin.rpc("grant_credits", {
        _user_id: data.userId,
        _amount: data.amount,
        _reason: data.reason,
        _meta: { by: context.userId },
      });
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.rpc("spend_credits", {
        _user_id: data.userId,
        _amount: -data.amount,
        _reason: data.reason,
        _module_key: null,
        _meta: { by: context.userId },
      });
      if (error) throw new Error("Could not deduct credits (insufficient balance?)");
    }

    const [{ data: actor }, { data: target }] = await Promise.all([
      supabaseAdmin.from("profiles").select("email").eq("id", context.userId).maybeSingle(),
      supabaseAdmin.from("profiles").select("email").eq("id", data.userId).maybeSingle(),
    ]);
    await supabaseAdmin.from("admin_audit_log").insert({
      actor_id: context.userId,
      actor_email: actor?.email ?? null,
      action: "credits.adjust",
      target_user_id: data.userId,
      target_email: target?.email ?? null,
      details: { amount: data.amount, reason: data.reason },
    });

    return { ok: true };
  });

export const setUserPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string; plan: string }) => {
    const plans = ["free", "starter", "pro", "agency"];
    if (!input?.userId || !plans.includes(input.plan)) throw new Error("Invalid input");
    return input;
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("profiles").update({ plan: data.plan }).eq("id", data.userId);
    if (error) throw new Error(error.message);

    const [{ data: actor }, { data: target }] = await Promise.all([
      supabaseAdmin.from("profiles").select("email").eq("id", context.userId).maybeSingle(),
      supabaseAdmin.from("profiles").select("email").eq("id", data.userId).maybeSingle(),
    ]);
    await supabaseAdmin.from("admin_audit_log").insert({
      actor_id: context.userId,
      actor_email: actor?.email ?? null,
      action: "plan.change",
      target_user_id: data.userId,
      target_email: target?.email ?? null,
      details: { to: data.plan },
    });
    return { ok: true };
  });

export const setSuspended = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string; suspended: boolean }) => {
    if (!input?.userId || typeof input.suspended !== "boolean") throw new Error("Invalid input");
    return input;
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ suspended: data.suspended })
      .eq("id", data.userId);
    if (error) throw new Error(error.message);

    const { data: actor } = await supabaseAdmin
      .from("profiles").select("email").eq("id", context.userId).maybeSingle();
    await supabaseAdmin.from("admin_audit_log").insert({
      actor_id: context.userId,
      actor_email: actor?.email ?? null,
      action: data.suspended ? "user.suspend" : "user.reinstate",
      target_user_id: data.userId,
      details: {},
    });
    return { ok: true };
  });

export const setModuleRate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { moduleKey: string; credits: number }) => {
    const credits = Math.trunc(Number(input?.credits));
    if (!input?.moduleKey || !Number.isFinite(credits) || credits < 0 || credits > 1000) {
      throw new Error("Invalid rate");
    }
    return { moduleKey: input.moduleKey, credits };
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context as Ctx);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("module_rates")
      .update({ credits: data.credits, updated_at: new Date().toISOString() })
      .eq("module_key", data.moduleKey);
    if (error) throw new Error(error.message);

    const { data: actor } = await supabaseAdmin
      .from("profiles").select("email").eq("id", context.userId).maybeSingle();
    await supabaseAdmin.from("admin_audit_log").insert({
      actor_id: context.userId,
      actor_email: actor?.email ?? null,
      action: "pricing.change",
      details: { module: data.moduleKey, credits: data.credits },
    });
    return { ok: true };
  });

export type AdminStats = {
  users: number;
  admins: number;
  generations: number;
  creditsOutstanding: number;
};

export const adminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminStats> => {
    await assertAdmin(context as Ctx);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: profiles }, { data: roles }, { count: gens }] = await Promise.all([
      supabaseAdmin.from("profiles").select("credits"),
      supabaseAdmin.from("user_roles").select("role").eq("role", "admin"),
      supabaseAdmin.from("generations").select("id", { count: "exact", head: true }),
    ]);
    return {
      users: (profiles ?? []).length,
      admins: (roles ?? []).length,
      generations: gens ?? 0,
      creditsOutstanding: (profiles ?? []).reduce((sum, p) => sum + (p.credits ?? 0), 0),
    };
  });
