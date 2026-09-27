import { createFileRoute } from "@tanstack/react-router";
import Itinerary from "@/pages/Itinerary";

const title = "رحلات الغوص | Diving & marine — Duroob";
const description =
  "Marine days planned around conditions and experience level: dive sites, surface intervals and coastal basecamps arranged with Duroob.";

export const Route = createFileRoute("/itineraries/diving")({
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
  component: () => <Itinerary itineraryId="diving" />,
});
