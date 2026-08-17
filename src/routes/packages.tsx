import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

import { MarketingShell } from "@/components/MarketingShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/packages")({
  head: () => ({
    meta: [
      { title: "Packages & pricing — Acclaira" },
      {
        name: "description",
        content:
          "Acclaira credit packages: 1 credit per thumbnail, 4 per SEO article, 10 per Urdu video. Starter, Pro and Agency plans.",
      },
      { property: "og:title", content: "Packages & pricing — Acclaira" },
      {
        property: "og:description",
        content: "Pay for output, not seats. Starter, Pro and Agency credit packages.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PackagesPage,
});

const PACKAGES = [
  {
    id: "starter",
    name: "Starter",
    price: 19,
    credits: 100,
    modules: "Module 1",
    extra: "Download thumbnails",
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 49,
    credits: 400,
    modules: "Modules 1 + 2",
    extra: "WordPress + FB/IG auto-publish",
    popular: true,
  },
  {
    id: "agency",
    name: "Agency",
    price: 99,
    credits: 1000,
    modules: "All 3 modules",
    extra: "Urdu video + TikTok + 5 brands",
    popular: false,
  },
];

function PackagesPage() {
  return (
    <MarketingShell>
      <div className="mx-auto w-full max-w-6xl px-5 py-16">
        <p className="mb-2 text-xs font-bold tracking-[0.16em] text-accent-foreground uppercase">
          Packages
        </p>
        <h1 className="mb-2 font-display text-3xl font-bold">Pay for output, not seats</h1>
        <p className="mb-10 text-sm text-muted-foreground">
          1 credit ≈ one thumbnail · 4 credits ≈ one article · 10 credits ≈ one video
        </p>

        <div className="grid items-stretch gap-5 md:grid-cols-3">
          {PACKAGES.map((p) => (
            <div
              key={p.id}
              className={`relative flex flex-col rounded-2xl bg-card p-6 ${
                p.popular ? "border-2 border-primary" : "border border-border"
              }`}
            >
              {p.popular && (
                <span className="absolute -top-3 left-6 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold tracking-wider text-primary-foreground uppercase">
                  Most popular
                </span>
              )}
              <h2 className="font-display text-lg font-semibold">{p.name}</h2>
              <p className="mt-4 mb-5">
                <span className="font-display text-4xl font-bold">${p.price}</span>
                <span className="text-sm text-muted-foreground"> / month</span>
              </p>
              <ul className="flex-1 space-y-2.5 text-sm">
                {[`${p.credits} credits / month`, p.modules, p.extra].map((line) => (
                  <li key={line} className="flex gap-2.5">
                    <Check size={16} className="mt-0.5 shrink-0 text-accent-foreground" />
                    {line}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                variant={p.popular ? "default" : "outline"}
                className="mt-6 w-full"
              >
                <Link to="/register">Choose {p.name}</Link>
              </Button>
            </div>
          ))}
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          Local payments (JazzCash / Easypaisa) available at checkout for Pakistan. Prices
          exclude tax.
        </p>
      </div>
    </MarketingShell>
  );
}
