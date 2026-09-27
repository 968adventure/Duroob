import { createFileRoute } from "@tanstack/react-router";
import Enquiry from "@/pages/Enquiry";

const title = "استفسار عن رحلة | Trip enquiry — Duroob";
const description =
  "Share the essentials of the journey you are considering and Duroob will open a structured WhatsApp conversation. Nothing is stored on the website.";

type EnquirySearch = { trip: string | undefined };

export const Route = createFileRoute("/enquire")({
  validateSearch: (search: Record<string, unknown>): EnquirySearch => ({
    trip: typeof search['trip'] === "string" ? (search['trip'] as string) : undefined,
  }),
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
  component: EnquiryRoute,
});

const allowedTrips = ["general", "bar-al-hikman", "salalah", "diving", "corporate", "women"];

function EnquiryRoute() {
  const { trip } = Route.useSearch();
  const initialTrip = trip && allowedTrips.includes(trip) ? trip : "general";
  return <Enquiry key={initialTrip} initialTrip={initialTrip} />;
}
