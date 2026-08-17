const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";

export async function chatJSON(system: string, user: string): Promise<Record<string, unknown>> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured");

  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: `${system}\nRespond with valid minified JSON only, no markdown fences.` },
        { role: "user", content: user },
      ],
    }),
  });

  if (res.status === 429) throw new Error("RATE_LIMIT");
  if (res.status === 402) throw new Error("AI_CREDITS");
  if (!res.ok) throw new Error("AI_UPSTREAM");

  const payload = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const raw = payload.choices?.[0]?.message?.content ?? "";
  const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    return JSON.parse(cleaned) as Record<string, unknown>;
  } catch {
    throw new Error("AI_PARSE");
  }
}

export const PROMPTS = {
  post: {
    system:
      "You are Acclaira's viral news editor for Pakistani social media. You write punchy, factual, non-sensational social copy.",
    user: (headline: string, language: string) =>
      `Headline: "${headline}". Language: ${language} (roman-urdu means Urdu written in Latin script).
Return JSON: {"thumbnail_title": string (max 8 words, ALL CAPS suitable for a thumbnail), "subtitle": string (max 10 words), "caption": string (2-3 sentences for Facebook/Instagram), "hashtags": string[] (8 trending, no '#'), "alt_text": string}`,
  },
  article: {
    system: "You are Acclaira's SEO news writer. You produce accurate, structured, search-ready articles.",
    user: (headline: string, language: string) =>
      `Headline: "${headline}". Language: ${language}.
Return JSON: {"title": string (SEO title under 60 chars), "meta_description": string (under 155 chars), "slug": string (kebab-case), "body_markdown": string (~350 words with H2 subheadings), "keywords": string[] (6), "image_prompt": string (16:9 feature image prompt)}`,
  },
  video: {
    system: "You are Acclaira's Urdu video scriptwriter for 60-second vertical news videos.",
    user: (headline: string, language: string) =>
      `Headline: "${headline}". Language: ${language}.
Return JSON: {"title": string, "hook": string (first 5 seconds, Urdu Nastaliq script), "script_urdu": string (60-second script in Urdu Nastaliq), "script_roman": string (same script in Roman Urdu), "scenes": [{"t": string (e.g. "0-10s"), "visual": string, "vo": string}], "cta": string}`,
  },
} as const;
