/**
 * Earthbound Glass itinerary page: bilingual route-specific reading, documentary imagery, and direct inquiry handoff.
 */
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpLeft, ArrowUpRight, Check, ChevronLeft, ChevronRight, Compass, MapPin, MessageCircle, ShieldCheck } from "lucide-react";

type Language = "ar" | "en";
type Bilingual = Record<Language, string>;
type ItineraryId = "bar-al-hikman" | "salalah" | "diving";

const itineraries: Record<ItineraryId, {
  index: string;
  accent: string;
  image: string;
  evidenceImage: string;
  evidenceAlt: Bilingual;
  tag: Bilingual;
  title: Bilingual;
  summary: Bilingual;
  terrain: Bilingual;
  focus: Bilingual[];
  note: Bilingual;
}> = {
  "bar-al-hikman": {
    index: "01",
    accent: "tide",
    image: "/media/duroob-bar-al-hikman-tide.jpg",
    evidenceImage: "/media/duroob-coastal-heritage-cabin.jpg",
    evidenceAlt: { ar: "بناء خشبي ساحلي في بر الحكمان", en: "Coastal wooden structure at Bar Al Hikman" },
    tag: { ar: "بر الحكمان · استكشاف ساحلي", en: "BAR AL HIKMAN · COASTAL EXPLORATION" },
    title: { ar: "على حافة المدّ في بر الحكمان.", en: "At the tidal edge of Bar Al Hikman." },
    summary: { ar: "تجربة ساحلية مرنة تبدأ من قاعدة ميدانية متنقلة، وتفتح وقتاً أبطأ لفهم الأرض المفتوحة والبحيرات والشاطئ.", en: "A flexible coastal experience that begins from a mobile field base and makes space to understand open land, lagoons, and shore at a slower pace." },
    terrain: { ar: "ساحل مفتوح · قاعدة متحركة · ضيافة ميدانية", en: "OPEN COAST · MOBILE BASE · FIELD HOSPITALITY" },
    focus: [
      { ar: "قاعدة ساحلية مجهزة للراحة والتنظيم.", en: "A coastal base set up for comfort and coordination." },
      { ar: "إيقاع ميداني يوازن بين الاستكشاف والضيافة.", en: "A field rhythm that balances exploration with hospitality." },
      { ar: "تُحدَّد تفاصيل المسار بحسب الموسم وظروف الأرض.", en: "Route details are shaped around season and ground conditions." },
    ],
    note: { ar: "تُناقش ملاءمة الوصول والأنشطة في مرحلة تصميم الرحلة.", en: "Access and activity suitability are discussed during itinerary design." },
  },
  salalah: {
    index: "02",
    accent: "khareef",
    image: "/media/duroob-salalah-khareef.jpg",
    evidenceImage: "/media/duroob-wadi-window.jpg",
    evidenceAlt: { ar: "ماء وصخر أخضر في وادٍ عُماني", en: "Water and green rock in an Omani wadi" },
    tag: { ar: "ظفار · صلالة", en: "DHOFAR · SALALAH" },
    title: { ar: "صلالة، عندما يتغيّر ملمس الجنوب.", en: "Salalah, when the south changes texture." },
    summary: { ar: "برنامج سياحي قابل للتشكيل حول طبيعة صلالة ومسافاتها، من الطرق الساحلية إلى تفاصيل الجنوب التي تُقرأ ببطء.", en: "A configurable tourism programme shaped around Salalah’s landscapes and distances, from coastal roads to the details of the south best read slowly." },
    terrain: { ar: "الجنوب · طرق ساحلية · رحلة مُصمّمة", en: "THE SOUTH · COASTAL ROADS · DESIGNED JOURNEY" },
    focus: [
      { ar: "تصميم رحلة ينسجم مع وقت المجموعة واهتماماتها.", en: "A route designed around a group’s time and interests." },
      { ar: "تجربة محلية تضع المكان قبل قائمة المعالم.", en: "A local experience that puts place before a checklist." },
      { ar: "تنسيق ميداني واضح من نقطة البداية إلى العودة.", en: "Clear field coordination from departure through return." },
    ],
    note: { ar: "البرنامج النهائي يُبنى معكم بعد فهم الموسم وحجم المجموعة.", en: "The final programme is shaped with you after confirming season and group size." },
  },
  diving: {
    index: "03",
    accent: "marine",
    image: "/media/duroob-diving-marine.jpg",
    evidenceImage: "/media/duroob-coastal-basecamp-awning.jpg",
    evidenceAlt: { ar: "تجهيز ميداني بجوار الساحل", en: "Field setup beside the coast" },
    tag: { ar: "البحر · رحلات غوص", en: "THE SEA · DIVING JOURNEYS" },
    title: { ar: "رحلات غوص تُصمَّم حول البحر.", en: "Diving journeys designed around the sea." },
    summary: { ar: "من التخطيط على الشاطئ إلى يوم البحر، تجمع دروب خبرة التنظيم الميداني وروح الاستكشاف الساحلي في برنامج واضح للضيوف والفرق.", en: "From shoreline planning to a day on the water, Duroob combines field coordination and coastal curiosity into a clear programme for guests and teams." },
    terrain: { ar: "ساحل · تخطيط بحري · فريق غوص", en: "COAST · MARINE PLANNING · DIVE CREW" },
    focus: [
      { ar: "حوار مبكر حول خبرة المجموعة وما يناسبها.", en: "An early discussion of group experience and fit." },
      { ar: "تنسيق ميداني يربط تجربة الشاطئ بوقت البحر.", en: "Field coordination that connects shore time with time at sea." },
      { ar: "تُؤكَّد الأنشطة وفق ظروف البحر والمتطلبات التشغيلية.", en: "Activities are confirmed against sea conditions and operational requirements." },
    ],
    note: { ar: "نحدّد تفاصيل المشاركة ومتطلباتها قبل تأكيد الرحلة.", en: "Participation details and requirements are confirmed before an expedition is finalised." },
  },
};

export default function Itinerary({ itineraryId }: { itineraryId: ItineraryId }) {
  const [language, setLanguage] = useState<Language>("ar");
  const isArabic = language === "ar";
  const itinerary = itineraries[itineraryId];

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
    document.title = `${itinerary.title[language]} — Duroob`;
  }, [isArabic, itinerary, language]);

  return (
    <main className={`itinerary-page itinerary-page--${itinerary.accent} ${isArabic ? "is-ar" : "is-en"}`} dir={isArabic ? "rtl" : "ltr"}>
      <section className="itinerary-hero">
        <img src={itinerary.image} alt={itinerary.title[language]} />
        <div className="itinerary-hero-tint" />
        <header className="itinerary-header">
          <Link to="/" className="itinerary-brand" aria-label={isArabic ? "العودة إلى موقع دروب" : "Back to Duroob website"}><span>دروب</span><small>DUROOB</small></Link>
          <button type="button" className="itinerary-language" onClick={() => setLanguage(isArabic ? "en" : "ar")}>{isArabic ? "English" : "العربية"}</button>
        </header>
        <div className="itinerary-hero-copy">
          <span className="itinerary-index">FIELD / {itinerary.index}</span>
          <p>{itinerary.tag[language]}</p>
          <h1>{itinerary.title[language]}</h1>
          <div className="itinerary-terrain"><MapPin size={16} /><span>{itinerary.terrain[language]}</span></div>
        </div>
        <aside className="itinerary-field-stamp glass-panel" aria-label={itinerary.terrain[language]}>
          <span>ROUTE MODE</span><strong>{itinerary.index}</strong><i /><p>{itinerary.terrain[language]}</p>
        </aside>
        <figure className="itinerary-window"><img src={itinerary.evidenceImage} alt={itinerary.evidenceAlt[language]} /><figcaption><span>FIELD EVIDENCE</span><i /></figcaption></figure>
      </section>

      <section className="itinerary-body">
        <aside className="itinerary-rail"><Link to="/" className="back-link">{isArabic ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}<span>{isArabic ? "العودة إلى الدروب" : "Back to routes"}</span></Link><i /><span>{itinerary.index} / 03</span></aside>
        <div className="itinerary-story">
          <p className="section-kicker">{isArabic ? "تفاصيل التجربة" : "EXPERIENCE NOTES"}</p>
          <h2>{itinerary.summary[language]}</h2>
          <div className="itinerary-focus-list">
            {itinerary.focus.map((item, index) => <div key={item[language]}><span>0{index + 1}</span><Check size={17} /><p>{item[language]}</p></div>)}
          </div>
          <div className="itinerary-note"><ShieldCheck size={18} /><p>{itinerary.note[language]}</p></div>
          <div className="itinerary-actions">
            <Link to="/enquire" search={{ trip: itineraryId }} className="itinerary-primary"><span>{isArabic ? "اطلبوا تفاصيل الرحلة" : "Request trip details"}</span>{isArabic ? <ArrowUpLeft size={18} /> : <ArrowUpRight size={18} />}</Link>
            <a href="https://wa.me/96896969143" target="_blank" rel="noreferrer" className="itinerary-whatsapp"><MessageCircle size={18} /><span>{isArabic ? "تواصل سريع عبر واتساب" : "Quick WhatsApp contact"}</span></a>
          </div>
        </div>
        <div className="itinerary-proof"><Compass size={22} /><span>{isArabic ? "يُصمَّم كل مسار بعد محادثة قصيرة معكم." : "Every route is shaped after a short conversation with you."}</span></div>
      </section>
    </main>
  );
}
