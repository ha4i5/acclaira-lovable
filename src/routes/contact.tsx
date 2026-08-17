import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Acclaira" },
      {
        name: "description",
        content:
          "Ask a question or book a walkthrough of Acclaira with the team. We reply within one working day.",
      },
      { property: "og:title", content: "Contact — Acclaira" },
      {
        property: "og:description",
        content: "Ask a question or book a walkthrough of Acclaira.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-6 py-20">
        <h1 className="text-4xl leading-tight font-semibold sm:text-5xl">Get in touch</h1>
        <p className="mt-5 text-muted-foreground">
          Tell us about your team and we'll show you what Acclaira would look like for you. We
          reply within one working day.
        </p>

        <form
          className="mt-12 space-y-6"
          onSubmit={(event) => {
            event.preventDefault();
            setSent(true);
            toast.success("Thanks — we'll be in touch shortly.");
          }}
        >
          <div>
            <label htmlFor="name" className="text-sm font-medium">
              Name
            </label>
            <input
              id="name"
              name="name"
              required
              className="mt-2 w-full rounded-sm border border-input bg-card px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="email" className="text-sm font-medium">
              Work email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-2 w-full rounded-sm border border-input bg-card px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="message" className="text-sm font-medium">
              What would you like to know?
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              className="mt-2 w-full rounded-sm border border-input bg-card px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-sm bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Send message
          </button>
          {sent ? (
            <p className="text-sm text-muted-foreground">
              Message noted. Nothing is stored yet — connect a backend to receive these.
            </p>
          ) : null}
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}
