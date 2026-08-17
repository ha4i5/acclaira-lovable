import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Globe,
  Languages,
  Newspaper,
  Radio,
  Video,
  Zap,
} from "lucide-react";

import { LogoMark } from "@/components/brand/Logo";
import { MarketingShell } from "@/components/MarketingShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Acclaira — One headline. Post, article, video." },
      {
        name: "description",
        content:
          "Acclaira turns a breaking headline into a branded viral post, an SEO WordPress article, and an Urdu voice-over video — captioned and published.",
      },
      { property: "og:title", content: "Acclaira — One headline. Post, article, video." },
      {
        property: "og:description",
        content:
          "AI newsroom automation: viral thumbnails, SEO articles on WordPress, and Urdu videos for Reels and TikTok.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const MODULES = [
  {
    icon: Newspaper,
    n: "Module 1",
    t: "Viral post generator",
    d: "Paste a headline, pick a design, get a branded thumbnail with caption, hashtags and keywords — posted to Facebook and Instagram by the rules.",
  },
  {
    icon: Globe,
    n: "Module 2",
    t: "News → SEO article",
    d: "Reads news from your sources, writes the article, publishes to WordPress with a feature image, and drops the live URL in the first comment.",
  },
  {
    icon: Video,
    n: "Module 3",
    t: "Urdu viral video",
    d: "Urdu voice over, word-by-word captions, auto cuts and crops — a vertical video rendered ready for Reels and TikTok.",
  },
];

function HomePage() {
  return (
    <MarketingShell>
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pt-16 pb-20 lg:grid-cols-2">
        <div>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-accent px-3.5 py-1.5 text-xs font-bold tracking-[0.16em] text-accent-foreground uppercase">
            <Radio size={13} /> Your newsroom, on autopilot
          </p>
          <h1 className="font-display text-4xl leading-[1.08] font-bold sm:text-5xl">
            One headline.
            <br />
            <span className="text-primary">Post. Article. Video.</span>
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">
            Acclaira turns breaking news into branded viral posts, SEO articles on your
            WordPress, and Urdu voice-over videos — captioned, hashtagged, and published.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/register">
                Start free <ArrowRight size={15} />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/packages">See packages</Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            No card needed · Built to Meta &amp; TikTok posting rules
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-sm">
          <div className="overflow-hidden rounded-2xl border border-border shadow-2xl">
            <div className="relative flex aspect-square flex-col justify-end bg-linear-160 from-primary to-navy">
              <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded bg-destructive px-2.5 py-1 text-[10px] font-bold text-destructive-foreground">
                <span className="lamp-live h-1.5 w-1.5 rounded-full bg-current" /> BREAKING
              </div>
              <div className="absolute top-4 right-4 text-navy-foreground opacity-90">
                <LogoMark size={26} />
              </div>
              <div className="p-5 pb-6">
                <p className="font-display text-[22px] leading-snug font-bold text-navy-foreground">
                  Govt announces major relief in petrol prices from tonight
                </p>
                <div className="mt-3 h-1 w-16 rounded bg-teal" />
                <p className="mt-2.5 text-[11px] font-semibold text-navy-foreground/60">
                  @acclaira · auto-generated
                </p>
              </div>
            </div>
            <div className="bg-card px-4 py-3 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Caption ready:</span> Big news
              for commuters tonight… 🔥{" "}
              <span className="text-primary">#PetrolPrice #Breaking</span>
            </div>
          </div>
          <div className="absolute -right-3 -bottom-4 flex items-center gap-1.5 rounded-xl bg-teal px-3.5 py-2 text-xs font-bold text-teal-foreground shadow-lg">
            <Zap size={13} /> Generated in 12s
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-paper">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <p className="mb-2 text-xs font-bold tracking-[0.16em] text-accent-foreground uppercase">
            The pipeline
          </p>
          <h2 className="mb-10 font-display text-3xl font-bold">Three modules, one flow</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {MODULES.map((m) => (
              <div key={m.n} className="rounded-2xl border border-border bg-card p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <m.icon size={20} />
                </div>
                <p className="mb-1 text-xs font-bold tracking-wider text-accent-foreground uppercase">
                  {m.n}
                </p>
                <h3 className="mb-2 font-display text-lg font-semibold">{m.t}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{m.d}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-primary text-primary-foreground">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-5 py-12 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <Languages size={28} className="text-teal" />
              <div>
                <h3 className="font-display text-xl font-semibold">اردو میں وائرل ویڈیوز</h3>
                <p className="mt-1 text-sm text-primary-foreground/75">
                  Native Urdu voice over with viral-style captions — built for Pakistani
                  news pages.
                </p>
              </div>
            </div>
            <Button asChild className="bg-teal text-teal-foreground hover:bg-teal/90">
              <Link to="/register">Try Module 3</Link>
            </Button>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
