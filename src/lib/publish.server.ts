type Conn = {
  id: string;
  platform: string;
  label: string;
  external_id: string | null;
  secret: string | null;
  config: Record<string, unknown>;
};

const GRAPH = "https://graph.facebook.com/v21.0";

export async function loadConnection(admin: any, userId: string, id: string): Promise<Conn> {
  const { data } = await admin
    .from("social_connections")
    .select("id, platform, label, external_id, secret, config")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) throw new Error("Connection not found");
  if (!data.secret) throw new Error("Connection has no stored credential");
  return data as Conn;
}

/** Publish an article to WordPress via the REST API and return the live URL. */
export async function publishToWordPress(
  conn: Conn,
  article: { title: string; content: string; excerpt: string; slug: string; status: string },
): Promise<{ url: string; id: number }> {
  const site = String(conn.config["site_url"] ?? conn.external_id ?? "").replace(/\/+$/, "");
  const username = String(conn.config["username"] ?? "");
  const auth = btoa(`${username}:${conn.secret}`);

  const res = await fetch(`${site}/wp-json/wp/v2/posts`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Basic ${auth}` },
    body: JSON.stringify({
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
      slug: article.slug,
      status: article.status,
    }),
  });

  const body = await res.text();
  if (!res.ok) throw new Error(`WordPress rejected the post [${res.status}]: ${body.slice(0, 300)}`);
  const json = JSON.parse(body) as { id: number; link: string };
  return { url: json.link, id: json.id };
}

/** Publish a photo post to a Facebook Page. */
export async function publishToFacebook(
  conn: Conn,
  post: { message: string; imageUrl?: string },
): Promise<{ url: string; id: string }> {
  const pageId = conn.external_id;
  const endpoint = post.imageUrl ? `${GRAPH}/${pageId}/photos` : `${GRAPH}/${pageId}/feed`;
  const params = new URLSearchParams({ access_token: String(conn.secret) });
  if (post.imageUrl) {
    params.set("url", post.imageUrl);
    params.set("caption", post.message);
  } else {
    params.set("message", post.message);
  }

  const res = await fetch(endpoint, { method: "POST", body: params });
  const body = await res.text();
  if (!res.ok) throw new Error(`Facebook rejected the post [${res.status}]: ${body.slice(0, 300)}`);
  const json = JSON.parse(body) as { id: string; post_id?: string };
  const id = json.post_id ?? json.id;
  return { id, url: `https://facebook.com/${id}` };
}

/** Two-step Instagram publish: create a media container, then publish it. */
export async function publishToInstagram(
  conn: Conn,
  post: { caption: string; imageUrl: string },
): Promise<{ url: string; id: string }> {
  const igId = conn.external_id;
  const token = String(conn.secret);

  const create = await fetch(`${GRAPH}/${igId}/media`, {
    method: "POST",
    body: new URLSearchParams({ image_url: post.imageUrl, caption: post.caption, access_token: token }),
  });
  const createBody = await create.text();
  if (!create.ok) throw new Error(`Instagram rejected the media [${create.status}]: ${createBody.slice(0, 300)}`);
  const containerId = (JSON.parse(createBody) as { id: string }).id;

  const publish = await fetch(`${GRAPH}/${igId}/media_publish`, {
    method: "POST",
    body: new URLSearchParams({ creation_id: containerId, access_token: token }),
  });
  const publishBody = await publish.text();
  if (!publish.ok) throw new Error(`Instagram publish failed [${publish.status}]: ${publishBody.slice(0, 300)}`);
  const id = (JSON.parse(publishBody) as { id: string }).id;
  return { id, url: `https://www.instagram.com/p/${id}` };
}

/** Add the article URL as the first comment under a Facebook post. */
export async function commentOnFacebook(conn: Conn, postId: string, message: string): Promise<void> {
  const res = await fetch(`${GRAPH}/${postId}/comments`, {
    method: "POST",
    body: new URLSearchParams({ message, access_token: String(conn.secret) }),
  });
  if (!res.ok) throw new Error(`Could not add the first comment [${res.status}]`);
}

export function markdownToHtml(markdown: string): string {
  const lines = markdown.split("\n");
  const out: string[] = [];
  let inList = false;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      if (inList) { out.push("</ul>"); inList = false; }
      continue;
    }
    const inline = line
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>");

    if (line.startsWith("### ")) out.push(`<h3>${inline.slice(4)}</h3>`);
    else if (line.startsWith("## ")) out.push(`<h2>${inline.slice(3)}</h2>`);
    else if (line.startsWith("# ")) out.push(`<h2>${inline.slice(2)}</h2>`);
    else if (/^[-*]\s+/.test(line)) {
      if (!inList) { out.push("<ul>"); inList = true; }
      out.push(`<li>${inline.replace(/^[-*]\s+/, "")}</li>`);
    } else out.push(`<p>${inline}</p>`);
  }
  if (inList) out.push("</ul>");
  return out.join("\n");
}
