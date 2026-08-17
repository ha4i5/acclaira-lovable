import { createFileRoute, Link } from "@tanstack/react-router";

import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Acclaira" },
      {
        name: "description",
        content:
          "Simple per-person pricing for Acclaira recognition. Free for small teams, flat monthly rates as you grow.",
      },
      { property: "og:title", content: "Pricing — Acclaira" },
      {
        property: "og:description",
        content: "Free for small teams, flat per-person pricing as you grow.",
      },
    ],
  }),
  component: PricingPage,
});

const plans = [
  {
    name: "Starter",
    price: "Free",
    note: "Up to 20 people",
    items: ["Acclaim feed", "Value tags", "Recognition profiles"],
  },
  {
    name: "Team",
    price: "$4",
    note: "per person / month",
    items: ["Everything in Starter", "Manager digests", "Milestones", "CSV export"],
    featured: true,
  },
  {
    name: "Company",
    price: "Custom",
    note: "250+ people",
    items: ["Everything in Team", "SSO and SCIM", "HRIS sync", "Dedicated support"],
  },
];

function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-20">
        <h1 className="text-4xl leading-tight font-semibold sm:text-5xl">Pricing</h1>
        <p className="mt-5 max-w-xl text-muted-foreground">
          One rate per person, billed monthly. No recognition credits, no points economy, no
          minimum spend.
        </p>

        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-sm border p-6 ${
                plan.featured ? "border-primary bg-card" : "border-border"
              }`}
            >
              <h2 className="text-lg font-semibold">{plan.name}</h2>
              <p className="mt-4 font-display text-4xl font-semibold">{plan.price}</p>
              <p className="mt-1 text-sm text-muted-foreground">{plan.note}</p>
              <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                {plan.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14">
          <Link
            to="/contact"
            className="inline-flex items-center justify-center rounded-sm bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Talk to us
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
