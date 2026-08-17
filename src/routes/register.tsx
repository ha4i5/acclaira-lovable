import { createFileRoute } from "@tanstack/react-router";

import { AuthCard } from "@/components/AuthCard";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create your account — Acclaira" },
      {
        name: "description",
        content:
          "Sign up for Acclaira and get 20 free credits to turn one headline into a post, article and video.",
      },
      { property: "og:title", content: "Create your account — Acclaira" },
      {
        property: "og:description",
        content: "Start free with 20 credits on Acclaira.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <AuthCard mode="register" />,
});
