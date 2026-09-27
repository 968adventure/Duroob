/**
 * Earthbound Glass utility: persistent, low-friction contact access across every Duroob route.
 */
import { MessageCircle } from "lucide-react";

const whatsappUrl = "https://wa.me/96896969143?text=Hello%20Duroob%2C%20I%20would%20like%20to%20ask%20about%20an%20expedition.";

export default function WhatsAppFloat() {
  return (
    <a className="whatsapp-float" href={whatsappUrl} target="_blank" rel="noreferrer" aria-label="WhatsApp Duroob at +968 96969143">
      <MessageCircle size={21} strokeWidth={2} />
      <span>واتساب <i>/</i> WhatsApp</span>
    </a>
  );
}
