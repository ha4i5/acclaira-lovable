import type { ReactNode } from "react";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const TICKER = [
  "BREAKING — Acclaira turns one headline into a post, an article, and a video",
  "VIRAL — thumbnails designed to Meta & TikTok rules",
  "SEO — WordPress articles published with a live URL",
  "URDU — AI voice over with word-by-word captions",
  "AUTO — captions, hashtags & keywords written for you",
];

export function Ticker() {
  return (
    <div className="overflow-hidden bg-navy text-navy-foreground">
      <div className="ticker-track flex whitespace-nowrap py-2">
        {[...TICKER, ...TICKER].map((t, i) => (
          <span
            key={i}
            className="mx-6 flex items-center gap-2 text-xs font-semibold tracking-wide"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-teal" />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Ticker />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
