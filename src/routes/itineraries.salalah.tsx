import { createFileRoute } from "@tanstack/react-router";
import Itinerary from "@/pages/Itinerary";

const title = "صلالة | Salalah — Duroob";
const description =
  "A Dhofar journey through khareef greenery, mountain escarpments and coastal roads, shaped by Duroob around season, group and pace.";

export const Route = createFileRoute("/itineraries/salalah")({
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
  component: () => <Itinerary itineraryId="salalah" />,
});
