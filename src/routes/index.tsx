import { createFileRoute, Link } from "@tanstack/react-router";

import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import heroImage from "../assets/hero-team.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Acclaira — Peer recognition for teams that notice" },
      {
        name: "description",
        content:
          "Acclaira turns everyday good work into a record your team can see. Send kudos, track impact, and celebrate people in the flow of work.",
      },
      { property: "og:title", content: "Acclaira — Peer recognition for teams that notice" },
      {
        property: "og:description",
        content: "Send kudos, track impact, and celebrate people in the flow of work.",
      },
    ],
  }),
  component: Index,
});

const highlights = [
  {
    title: "Kudos in seconds",
    body: "A short note, a value tag, a teammate. No forms, no approval chains, no quarterly scramble.",
  },
  {
    title: "A visible record",
    body: "Every acclaim lands on a shared wall and on the person's profile, so good work stops disappearing.",
  },
  {
    title: "Signals for managers",
    body: "See who is carrying the team, who is being overlooked, and what your values actually look like in practice.",
  },
];

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        <section className="mx-auto max-w-5xl px-6 pt-20 pb-16 text-center">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Employee recognition
          </p>
          <h1 className="mx-auto mt-5 max-w-3xl text-5xl leading-[1.05] font-semibold text-balance sm:text-6xl">
            Good work should be impossible to miss.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Acclaira gives every person on your team a simple way to say thank you — and gives
            your company a lasting record of who made things happen.
          </p>
          <div className="mt-9">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-sm bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Request a walkthrough
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6">
          <img
            src={heroImage}
            alt="A team applauding a colleague around a table in a sunlit office"
            width={1408}
            height={1008}
            className="w-full rounded-sm border border-border object-cover"
          />
        </section>

        <section className="mx-auto max-w-5xl px-6 py-20">
          <div className="grid gap-10 sm:grid-cols-3">
            {highlights.map((item) => (
              <div key={item.title}>
                <h2 className="text-xl font-semibold">{item.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-border/70 bg-secondary/60">
          <div className="mx-auto max-w-3xl px-6 py-20 text-center">
            <blockquote className="font-display text-2xl leading-snug text-balance sm:text-3xl">
              “We stopped guessing who was quietly holding the team together. Now we can see it,
              week by week.”
            </blockquote>
            <p className="mt-6 text-sm text-muted-foreground">
              Dana Whitfield · Head of People, Northbeam
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-20 text-center">
          <h2 className="text-3xl font-semibold">Start recognising people this week</h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Acclaira takes about ten minutes to set up and needs no change to how your team already
            works.
          </p>
          <div className="mt-8">
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center rounded-sm border border-foreground/20 px-6 py-3 text-sm font-medium transition-colors hover:bg-accent/30"
            >
              See pricing
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
