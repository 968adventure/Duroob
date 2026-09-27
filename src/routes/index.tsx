import { createFileRoute } from "@tanstack/react-router";
import Home from "@/pages/Home";

const title = "دروب Duroob | Oman Expeditions & Team Adventures";
const description =
  "Duroob designs Omani wilderness expeditions for corporate teams, women's retreats, overlanding and marine journeys — planned around terrain, season and group.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});
