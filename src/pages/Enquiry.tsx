/**
 * Earthbound Glass enquiry flow: a bilingual, client-side form that prepares a complete WhatsApp trip brief without collecting server-side data.
 */
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpLeft, ArrowUpRight, ChevronLeft, ChevronRight, Compass, MessageCircle, Send } from "lucide-react";

type Language = "ar" | "en";

const tripLabels: Record<string, Record<Language, string>> = {
  general: { ar: "استشارة عامة", en: "General expedition" },
  "bar-al-hikman": { ar: "بر الحكمان", en: "Bar Al Hikman" },
  salalah: { ar: "رحلة صلالة", en: "Salalah journey" },
  diving: { ar: "رحلة غوص", en: "Diving trip" },
  corporate: { ar: "تجربة فرق أو شركات", en: "Corporate / team experience" },
  women: { ar: "خلوة نسائية خاصة", en: "Women-exclusive retreat" },
};

export default function Enquiry({ initialTrip = "general" }: { initialTrip?: string }) {
  const [language, setLanguage] = useState<Language>("ar");
  const [trip, setTrip] = useState(initialTrip);
  const isArabic = language === "ar";
  const labels = useMemo(() => isArabic ? {
    kicker: "ابدأوا المحادثة", title: "ما الرحلة التي تفكّرون فيها؟", body: "املؤوا التفاصيل الأساسية، وسنفتح رسالة واتساب منظمة لبدء الحديث مع دروب.", name: "الاسم", contact: "البريد أو رقم الهاتف", trip: "نوع التجربة", group: "حجم المجموعة", timing: "الفترة المفضلة", notes: "ما الذي تريدون أن تصنعه الرحلة؟", submit: "فتح المحادثة عبر واتساب", back: "العودة إلى الدروب", required: "يرجى إكمال الحقول المطلوبة.", privacy: "لا نخزّن هذه البيانات في الموقع؛ تُرسل التفاصيل فقط عند فتح واتساب من قبلكم.", groupPlaceholder: "مثال: 6 ضيوف", timingPlaceholder: "مثال: أكتوبر 2026", notesPlaceholder: "أخبرونا عن الهدف، الاهتمامات، أو أي متطلبات مهمة.",
  } : {
    kicker: "START THE CONVERSATION", title: "Which journey are you considering?", body: "Share the essentials and we will open a structured WhatsApp message to begin the conversation with Duroob.", name: "Name", contact: "Email or mobile", trip: "Experience type", group: "Group size", timing: "Preferred timing", notes: "What should the journey make possible?", submit: "Open WhatsApp conversation", back: "Back to Duroob", required: "Please complete the required fields.", privacy: "We do not store this information on the website; details are only sent when you open WhatsApp.", groupPlaceholder: "For example: 6 guests", timingPlaceholder: "For example: October 2026", notesPlaceholder: "Tell us about the goal, interests, or any important requirements.",
  }, [isArabic]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
    document.title = isArabic ? "استفسار عن رحلة — دروب" : "Trip enquiry — Duroob";
  }, [isArabic, language]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const message = isArabic
      ? `مرحباً دروب، أود الاستفسار عن رحلة.\n\nالاسم: ${data.get("name")}\nالتواصل: ${data.get("contact")}\nنوع التجربة: ${tripLabels[trip]?.ar || trip}\nحجم المجموعة: ${data.get("group")}\nالفترة المفضلة: ${data.get("timing")}\nتفاصيل إضافية: ${data.get("notes") || "—"}`
      : `Hello Duroob, I would like to enquire about a journey.\n\nName: ${data.get("name")}\nContact: ${data.get("contact")}\nExperience: ${tripLabels[trip]?.en || trip}\nGroup size: ${data.get("group")}\nPreferred timing: ${data.get("timing")}\nAdditional details: ${data.get("notes") || "—"}`;
    window.open(`https://wa.me/96896969143?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <main className={`enquiry-page ${isArabic ? "is-ar" : "is-en"}`} dir={isArabic ? "rtl" : "ltr"}>
      <div className="enquiry-topbar"><Link to="/" className="back-link">{isArabic ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}<span>{labels.back}</span></Link><button type="button" className="enquiry-language" onClick={() => setLanguage(isArabic ? "en" : "ar")}>{isArabic ? "English" : "العربية"}</button></div>
      <div className="enquiry-shell">
        <section className="enquiry-intro"><p className="section-kicker">{labels.kicker}</p><h1>{labels.title}</h1><p>{labels.body}</p><div className="enquiry-planning-stamp"><Compass size={18} /><div><span>PLAN / 01</span><strong>{isArabic ? "نقطة الانطلاق" : "THE STARTING POINT"}</strong></div><i /></div><div className="enquiry-whatsapp-mark"><MessageCircle size={22} /><span dir="ltr">+968 96969143</span></div></section>
        <form className="enquiry-form glass-panel" onSubmit={handleSubmit}>
          <label><span>{labels.name}</span><input name="name" required autoComplete="name" /></label>
          <label><span>{labels.contact}</span><input name="contact" required autoComplete="email" type="text" /></label>
          <label><span>{labels.trip}</span><select name="trip" value={trip} onChange={(event) => setTrip(event.target.value)} required>{Object.entries(tripLabels).map(([value, item]) => <option value={value} key={value}>{item[language]}</option>)}</select></label>
          <div className="enquiry-inline"><label><span>{labels.group}</span><input name="group" required placeholder={labels.groupPlaceholder} /></label><label><span>{labels.timing}</span><input name="timing" required placeholder={labels.timingPlaceholder} /></label></div>
          <label><span>{labels.notes}</span><textarea name="notes" rows={4} placeholder={labels.notesPlaceholder} /></label>
          <button type="submit" className="enquiry-submit"><span>{labels.submit}</span>{isArabic ? <ArrowUpLeft size={18} /> : <ArrowUpRight size={18} />}</button>
          <p className="enquiry-privacy"><Send size={14} />{labels.privacy}</p>
        </form>
      </div>
    </main>
  );
}
