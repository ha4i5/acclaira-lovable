import { createFileRoute } from "@tanstack/react-router";

import { MarketingShell } from "@/components/MarketingShell";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of service — Acclaira" },
      {
        name: "description",
        content:
          "The terms covering Acclaira accounts, credits, generated content ownership, and acceptable use of connected publishing channels.",
      },
      { property: "og:title", content: "Terms of service — Acclaira" },
      {
        property: "og:description",
        content: "Account, credit and acceptable-use terms for the Acclaira platform.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TermsPage,
});

const SECTIONS = [
  {
    h: "Your account",
    p: "You are responsible for the accuracy of the details on your account and for keeping your password safe. One account per person; accounts may be suspended for abuse or non-payment.",
  },
  {
    h: "Credits",
    p: "Generations consume credits at the rates shown on the packages page. Credits are charged when a job starts and refunded automatically if the job fails. Credits are non-transferable and do not expire while your account is active.",
  },
  {
    h: "Your content",
    p: "You own the headlines you supply and the posts, articles, scripts and videos Acclaira generates for you. You are responsible for verifying facts before publishing and for complying with the rules of every platform you publish to.",
  },
  {
    h: "Acceptable use",
    p: "Do not use Acclaira to produce content that is unlawful, defamatory, hateful, or deliberately misleading, and do not use it to impersonate news outlets you are not authorised to represent.",
  },
  {
    h: "Availability",
    p: "The service is provided as is. Third-party APIs (AI providers, Meta, WordPress, TTS) can change or fail; we work around outages where we can but cannot guarantee uninterrupted publishing.",
  },
];

function TermsPage() {
  return (
    <MarketingShell>
      <div className="mx-auto w-full max-w-3xl px-5 py-16">
        <h1 className="font-display text-3xl font-bold">Terms of service</h1>
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
