export type FeedItem = {
  title: string;
  link: string;
  published: string | null;
  summary: string;
};

function decode(input: string): string {
  return input
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .trim();
}

function tag(block: string, name: string): string {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  return m?.[1] ? decode(m[1]) : "";
}

function stripHtml(input: string): string {
  return decode(
    input
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  ).replace(/\s+/g, " ");
}

async function get(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "user-agent": "AcclairaBot/1.0 (+https://acclaira.com)", accept: "*/*" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`Source returned ${res.status}`);
  return res.text();
}

/** Parse an RSS 2.0 or Atom feed into normalised items. */
export async function fetchFeed(url: string, limit = 15): Promise<FeedItem[]> {
  const xml = await get(url);
  const blocks = xml.match(/<(item|entry)[\s\S]*?<\/(item|entry)>/gi) ?? [];

  return blocks.slice(0, limit).map((block) => {
    const linkTag = tag(block, "link");
    const href = block.match(/<link[^>]*href="([^"]+)"/i)?.[1] ?? "";
    const description = tag(block, "description") || tag(block, "summary") || tag(block, "content:encoded");
    return {
      title: tag(block, "title"),
      link: linkTag || href,
      published: tag(block, "pubDate") || tag(block, "updated") || tag(block, "published") || null,
      summary: stripHtml(description).slice(0, 400),
    };
  }).filter((i) => i.title);
}

/** Download a news page and return its readable text for the model to analyse. */
export async function fetchArticleText(url: string): Promise<{ title: string; text: string }> {
  const html = await get(url);
  const title =
    html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i)?.[1] ??
    html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ??
    "";

  const article = html.match(/<article[\s\S]*?<\/article>/i)?.[0] ?? html;
  const text = stripHtml(article).slice(0, 12000);
  return { title: decode(title), text };
}
