import { createFileRoute } from "@tanstack/react-router";

import { AuthCard } from "@/components/AuthCard";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — Acclaira" },
      {
        name: "description",
        content: "Log in to your Acclaira account to generate posts, articles and Urdu videos.",
      },
      { property: "og:title", content: "Log in — Acclaira" },
      { property: "og:description", content: "Access your Acclaira newsroom dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <AuthCard mode="login" />,
});
