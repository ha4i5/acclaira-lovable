import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type NewsSource = {
  id: string;
  label: string;
  kind: string;
  url: string;
  active: boolean;
  created_at: string;
};

export type FeedItem = {
  title: string;
  link: string;
  published: string | null;
  summary: string;
};

const KINDS = ["rss", "link", "facebook", "instagram", "website"];

export const listSources = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<NewsSource[]> => {
    const { data } = await context.supabase
      .from("news_sources")
      .select("id, label, kind, url, active, created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    return (data ?? []) as NewsSource[];
  });

export const addSource = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { label: string; kind: string; url: string }) => {
    const label = (input?.label ?? "").trim();
    const url = (input?.url ?? "").trim();
    if (label.length < 2 || label.length > 80) throw new Error("Label must be 2-80 characters");
    if (!/^https?:\/\/\S+$/i.test(url)) throw new Error("Enter a valid http(s) URL");
    const kind = KINDS.includes(input?.kind) ? input.kind : "rss";
    return { label, kind, url };
  })
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("news_sources")
      .insert({ ...data, user_id: context.userId });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteSource = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => {
    if (!input?.id) throw new Error("Missing source");
    return { id: input.id };
  })
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("news_sources")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Pull the latest headlines from one saved feed. */
export const readSource = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => {
    if (!input?.id) throw new Error("Missing source");
    return { id: input.id };
  })
  .handler(async ({ data, context }): Promise<FeedItem[]> => {
    const { data: source } = await context.supabase
      .from("news_sources")
      .select("url, kind")
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!source) throw new Error("Source not found");

    const { fetchFeed, fetchArticleText } = await import("./news.server");
    if (source.kind === "rss") return fetchFeed(source.url);

    const page = await fetchArticleText(source.url);
    return [{ title: page.title || source.url, link: source.url, published: null, summary: page.text.slice(0, 400) }];
  });

/** Read any pasted news URL and summarise it into a usable headline. */
export const readLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { url: string }) => {
    const url = (input?.url ?? "").trim();
    if (!/^https?:\/\/\S+$/i.test(url)) throw new Error("Enter a valid http(s) URL");
    return { url };
  })
  .handler(async ({ data }) => {
    const { fetchArticleText } = await import("./news.server");
    const { chatJSON } = await import("./ai.server");
    const page = await fetchArticleText(data.url);

    const result = await chatJSON(
      "You are a news desk editor. You summarise a source page accurately without inventing facts.",
      `Source URL: ${data.url}
Page title: ${page.title}
Page text: ${page.text.slice(0, 6000)}

Return JSON: {"headline": string (a clear factual headline under 120 chars), "summary": string (3 sentences), "angle": string (one suggested viral angle)}`,
    );

    return {
      headline: String(result["headline"] ?? page.title),
      summary: String(result["summary"] ?? ""),
      angle: String(result["angle"] ?? ""),
      source_url: data.url,
    };
  });
