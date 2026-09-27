import { permanentRedirect } from "next/navigation";

// The event's name carries the ñ — people will type or share it literally.
// The canonical route stays ASCII; this 308s to it. A filesystem route
// instead of next.config redirects(): path-pattern matching there is
// finicky with non-ASCII sources, while filesystem routing decodes %C3%B1
// reliably. The matcher entries in proxy.ts cover both decoded/encoded
// forms so anonymous traffic reaches here.
export default function TransmontanaAccentedPage() {
  permanentRedirect("/transmontana");
}
