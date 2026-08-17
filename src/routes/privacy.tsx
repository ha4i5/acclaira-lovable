import { createFileRoute } from "@tanstack/react-router";

import { MarketingShell } from "@/components/MarketingShell";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy policy — Acclaira" },
      {
        name: "description",
        content:
          "How Acclaira collects, encrypts and uses your account data, API credentials and generated content.",
      },
      { property: "og:title", content: "Privacy policy — Acclaira" },
      {
        property: "og:description",
        content: "How Acclaira handles your account data and connected channel credentials.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPage,
});

const SECTIONS = [
  {
    h: "What we collect",
    p: "Your name and email at signup, the headlines and content you generate, the credentials you add for your own channels (WordPress, Meta, AI providers, TTS), and billing records for credit purchases.",
  },
  {
    h: "How credentials are stored",
    p: "Every third-party key or token you save in Settings is encrypted at rest with AES-256. Keys are decrypted only in memory when a generation or publish job you triggered needs them, and are never shown back to you in full.",
  },
  {
    h: "Generated content",
    p: "Thumbnails, articles, scripts and videos you create are stored against your account so you can review them in History. Deleting an item removes it from our storage.",
  },
  {
    h: "Third parties",
    p: "We send prompts to the AI provider whose key you configured, publish only to the channels you set Live, and process email through the SMTP mailbox configured for the platform. We do not sell data.",
  },
  {
    h: "Your rights",
    p: "You can export or delete your account data at any time from Account, or by emailing the address on the contact page. Deleting your account removes credentials immediately and content within 30 days.",
  },
];

function PrivacyPage() {
  return (
    <MarketingShell>
      <div className="mx-auto w-full max-w-3xl px-5 py-16">
        <h1 className="font-display text-3xl font-bold">Privacy policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated 18 August 2026</p>
        <div className="mt-10 space-y-8">
          {SECTIONS.map((s) => (
            <section key={s.h}>
              <h2 className="font-display text-lg font-semibold">{s.h}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.p}</p>
            </section>
          ))}
        </div>
      </div>
    </MarketingShell>
  );
}
