import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type PublishJob = {
  id: string;
  platform: string;
  target: string | null;
  status: string;
  post_url: string | null;
  error: string | null;
  created_at: string;
};

export const listPublishJobs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PublishJob[]> => {
    const { data } = await context.supabase
      .from("publish_jobs")
      .select("id, platform, target, status, post_url, error, created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(50);
    return (data ?? []) as PublishJob[];
  });

/** Publish a generated SEO article to a connected WordPress site. */
export const publishArticle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    connectionId: string;
    title: string;
    bodyMarkdown: string;
    metaDescription: string;
    slug: string;
    keywords: string[];
    status: string;
  }) => {
    if (!input?.connectionId) throw new Error("Choose a WordPress connection");
    const title = (input.title ?? "").trim();
    const bodyMarkdown = (input.bodyMarkdown ?? "").trim();
    if (title.length < 5) throw new Error("Title is too short");
    if (bodyMarkdown.length < 100) throw new Error("Article body is too short");
    return {
      connectionId: input.connectionId,
      title,
      bodyMarkdown,
      metaDescription: (input.metaDescription ?? "").slice(0, 300),
      slug: (input.slug ?? "").trim().slice(0, 120),
      keywords: Array.isArray(input.keywords) ? input.keywords.slice(0, 12).map(String) : [],
      status: input.status === "draft" ? "draft" : "publish",
    };
  })
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { loadConnection, publishToWordPress, markdownToHtml } = await import("./publish.server");

    const conn = await loadConnection(supabaseAdmin, context.userId, data.connectionId);
    if (conn.platform !== "wordpress") throw new Error("That connection is not a WordPress site");

    const { data: article } = await supabaseAdmin
      .from("articles")
      .insert({
        user_id: context.userId,
        title: data.title,
        slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 80),
        meta_description: data.metaDescription,
        body_markdown: data.bodyMarkdown,
        keywords: data.keywords,
        status: "draft",
      })
      .select("id")
      .single();

    const articleId: string | null = article?.id ?? null;

    try {
      const result = await publishToWordPress(conn, {
        title: data.title,
        content: markdownToHtml(data.bodyMarkdown),
        excerpt: data.metaDescription,
        slug: data.slug,
        status: data.status,
      });

      if (articleId) {
        await supabaseAdmin
          .from("articles")
          .update({ status: data.status === "draft" ? "draft" : "published", published_url: result.url })
          .eq("id", articleId);
      }

      await supabaseAdmin.from("publish_jobs").insert({
        user_id: context.userId,
        platform: "wordpress",
        target: conn.label,
        status: "success",
        article_id: articleId,
        post_url: result.url,
      });

      return { url: result.url, articleId };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Publish failed";
      await supabaseAdmin.from("publish_jobs").insert({
        user_id: context.userId,
        platform: "wordpress",
        target: conn.label,
        status: "failed",
        article_id: articleId,
        error: message.slice(0, 500),
      });
      throw new Error(message);
    }

  });

/** Publish a social post to a Facebook Page or Instagram account. */
export const publishSocial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    connectionId: string;
    caption: string;
    imageUrl?: string;
    firstComment?: string;
  }) => {
    if (!input?.connectionId) throw new Error("Choose a channel");
    const caption = (input.caption ?? "").trim();
    if (caption.length < 5) throw new Error("Caption is too short");
    const imageUrl = (input.imageUrl ?? "").trim();
    if (imageUrl && !/^https:\/\/\S+$/i.test(imageUrl)) throw new Error("Image URL must be https");
    return {
      connectionId: input.connectionId,
      caption: caption.slice(0, 2200),
      imageUrl,
      firstComment: (input.firstComment ?? "").trim().slice(0, 500),
    };
  })
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { loadConnection, publishToFacebook, publishToInstagram, commentOnFacebook } =
      await import("./publish.server");

    const conn = await loadConnection(supabaseAdmin, context.userId, data.connectionId);

    try {
      let result: { url: string; id: string };
      if (conn.platform === "facebook") {
        result = await publishToFacebook(conn, {
          message: data.caption,
          ...(data.imageUrl ? { imageUrl: data.imageUrl } : {}),
        });
        if (data.firstComment) await commentOnFacebook(conn, result.id, data.firstComment);
      } else if (conn.platform === "instagram") {
        if (!data.imageUrl) throw new Error("Instagram needs a public image URL");
        result = await publishToInstagram(conn, { caption: data.caption, imageUrl: data.imageUrl });
      } else {
        throw new Error("That connection cannot post social content");
      }

      await supabaseAdmin.from("publish_jobs").insert({
        user_id: context.userId,
        platform: conn.platform,
        target: conn.label,
        status: "success",
        post_url: result.url,
      });
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Publish failed";
      await supabaseAdmin.from("publish_jobs").insert({
        user_id: context.userId,
        platform: conn.platform,
        target: conn.label,
        status: "failed",
        error: message.slice(0, 500),
      });
      throw new Error(message);
    }
  });
