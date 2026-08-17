# Acclaira — full platform structure

Before building, here is the structure and the two places your spec needs adjusting for this environment.

## Reality check on the stack (2 items)

1. **Framework.** This project runs TanStack Start (React 19 + Vite) with Lovable Cloud (Postgres + auth + storage). It is not Next.js and cannot be converted. Everything in your spec maps 1:1 — routes instead of `app/`, server functions instead of API routes — but folder names differ.
2. **Video rendering (Module 3).** FFmpeg, Remotion, Puppeteer and BullMQ workers need a Node server with binaries. The backend here is a serverless edge runtime, so there is no place to run them. Module 3 will therefore ship as: Urdu script + TTS audio + timed caption track + shot list, exported as a package you render externally — OR we call a hosted render API (Shotstack / Creatomate) which does run from here. Everything else in your spec is fully buildable.

## What already exists

Landing, packages, privacy, terms, login/register, dashboard, credits ledger, API keys, public REST API v1, docs page, admin console (users, roles, plans, credits, pricing editor, audit log), and a first-pass Studio with post/article/video text generation.

## Route structure to build out

```text
src/routes/
  index.tsx  packages  contact  privacy  terms  docs      # public
  login  register
  _authenticated/
    dashboard.tsx            # credits, recent activity
    module-1.tsx             # viral post generator
    module-2.tsx             # article + full pipeline
    module-3.tsx             # urdu video package
    sources.tsx              # news sources: RSS, links, IG/FB pages
    connections.tsx          # FB page, IG business, WordPress, TikTok
    designs.tsx              # brand templates
    history.tsx              # every generation + publish job
    credits.tsx  api-keys.tsx
    admin.tsx                # users, packages, templates, usage, settings
  api/public/v1/generate.ts  # REST API
  api/public/webhooks/*      # stripe, meta

src/lib/
  ai.server.ts               # caption, article, urdu script prompts
  news.server.ts             # RSS + link fetch + extract + analyse
  render.server.ts           # thumbnail composition
  integrations/
    meta.server.ts           # FB page + IG publish, first comment
    wordpress.server.ts      # WP REST publish, returns live URL
    tts.server.ts            # urdu voice over
  *.functions.ts             # typed server functions the UI calls
```

## Database tables

Existing: `profiles`, `user_roles`, `admin_audit_log`, `module_rates`, `credit_transactions`, `generations`, `api_keys`, `brands`.

To add: `packages`, `subscriptions`, `social_connections` (encrypted tokens), `news_sources`, `design_templates`, `articles`, `videos`, `publish_jobs`, `assets`. All with row-level security scoped to the owner, plus a storage bucket for images, audio and renders.

## Module flows as they will actually work

**Module 1 — viral post**
Pick or paste news → AI extracts headline + summary → upload an image or generate one (Gemini image model) → pick a branded template → composite headline + image + logo on canvas at 1:1, 16:9, 9:16 → preview → download PNG → AI writes caption, hashtags, keywords tuned to Meta/TikTok rules → one-click publish to FB Page / IG Business.

**Module 2 — full pipeline**
Fetch from your saved sources → AI reads and analyses → SEO article (title, meta, headings, keywords, body) → YouTube-style feature image → publish to WordPress via REST, capture live URL → run Module 1 on the same story → publish social post → post the article URL as the first comment.

**Module 3 — urdu video**
Article text → Urdu script (Nastaliq + Roman) → Urdu TTS voice over (audio file you can play and download) → word-by-word caption track with timings → shot list with generated b-roll stills → either a render-API job producing a 9:16 MP4, or a downloadable package.

## Connections and publishing

WordPress uses the WordPress connector (site URL + application password) — no credentials in the app. Meta needs a Facebook app with `pages_manage_posts` and `instagram_content_publish`; you connect a Page and its linked IG Business account, and tokens are stored encrypted server-side. TikTok posting is API-gated by approval; until then Module 1 exports a ready 9:16 file.

## Credits

Every generation and publish deducts from the atomic ledger with auto-refund on upstream failure, rates editable by admin. Current: post 1, article 4, video 10 — plus new line items for image generation, TTS and publishing.

## Build order

1. Sources + connections (WordPress first, then Meta) and the storage bucket.
2. Design templates library + admin template manager + the canvas render engine.
3. Module 1 end to end, including publish.
4. Module 2 pipeline reusing Module 1.
5. Module 3 script + TTS + captions, then the render decision.
6. Packages, Stripe checkout, subscriptions, usage/cost monitoring in admin.

## Two decisions I need from you

- **Module 3 rendering:** hosted render API (real MP4 in-app, needs an account) or downloadable package for local editing?
- **Design templates:** send the layouts you want and I'll build the library around them, or I create three starter templates now and you replace them later?
