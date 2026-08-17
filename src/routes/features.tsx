import { createFileRoute } from "@tanstack/react-router";

import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — Acclaira recognition platform" },
      {
        name: "description",
        content:
          "Kudos feeds, value tags, recognition profiles, and manager insights — everything Acclaira gives teams to make good work visible.",
      },
      { property: "og:title", content: "Features — Acclaira recognition platform" },
      {
        property: "og:description",
        content: "Kudos feeds, value tags, recognition profiles, and manager insights.",
      },
    ],
  }),
  component: FeaturesPage,
});

const features = [
  {
    title: "The acclaim feed",
    body: "A single chronological wall of recognition across the company. Anyone can post, anyone can add to someone else's note, and nothing gets buried in a thread.",
  },
  {
    title: "Value tags",
    body: "Attach one of your company values to every acclaim. Over time the feed becomes evidence of what your values look like in real work, not on a poster.",
  },
  {
    title: "Recognition profiles",
    body: "Each person keeps a running page of the work they were thanked for. It writes itself, and it makes review season far less painful.",
  },
  {
    title: "Manager digests",
    body: "A weekly summary showing who was recognised, who hasn't been mentioned in a while, and where recognition is clustering.",
  },
  {
    title: "Moments and milestones",
    body: "Work anniversaries, first shipped project, end-of-quarter wins — Acclaira prompts the team so nobody has to remember the calendar.",
  },
  {
    title: "Exports and reporting",
    body: "Pull recognition data into your HR system or a spreadsheet whenever you need it. Your data stays yours.",
  },
];

function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-20">
        <h1 className="max-w-2xl text-4xl leading-tight font-semibold sm:text-5xl">
          Everything you need to make good work visible.
        </h1>
        <p className="mt-5 max-w-xl text-muted-foreground">
          Acclaira is deliberately small. These are the parts teams actually use.
        </p>

        <div className="mt-16 grid gap-x-12 gap-y-12 sm:grid-cols-2">
          {features.map((feature) => (
            <article key={feature.title} className="border-t border-border pt-6">
              <h2 className="text-xl font-semibold">{feature.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
            </article>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
