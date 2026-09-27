import { createFileRoute } from "@tanstack/react-router";
import Itinerary from "@/pages/Itinerary";

const title = "بر الحكمان | Bar Al Hikman — Duroob";
const description =
  "A tidal coastal journey at Bar Al Hikman: sandflats, migratory birdlife and a low-impact field camp, planned with Duroob around season and tide.";

export const Route = createFileRoute("/itineraries/bar-al-hikman")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <Itinerary itineraryId="bar-al-hikman" />,
});
