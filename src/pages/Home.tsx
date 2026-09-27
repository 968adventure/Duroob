/**
 * Earthbound Glass: bilingual Duroob expedition platform.
 * Visual anchors: terrain-led motion, translucent sand-glass layers, and safety-forward operational clarity.
 */
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpLeft,
  ArrowUpRight,
  ChevronDown,
  Compass,
  HeartPulse,
  Instagram,
  Mail,
  MapPinned,
  Mountain,
  Phone,
  Radio,
  Satellite,
  ShipWheel,
  ShieldCheck,
  TentTree,
  UsersRound,
  Wrench,
} from "lucide-react";

type Language = "ar" | "en";
type Bilingual = Record<Language, string>;

const instagramUrl = "https://www.instagram.com/duroob.om?igsi=MTM3YTlvaTg1MGR4ZA==";

const contacts: Array<{ icon: LucideIcon; label: Bilingual; value: string; href: string; external?: boolean }> = [
  { icon: Phone, label: { ar: "اتصال مباشر", en: "Direct call" }, value: "+968 96969143", href: "tel:+96896969143" },
  { icon: Mail, label: { ar: "البريد الإلكتروني", en: "Email" }, value: "duroob@gmail.com", href: "mailto:duroob@gmail.com" },
  { icon: Instagram, label: { ar: "إنستغرام", en: "Instagram" }, value: "@duroob.om", href: instagramUrl, external: true },
];

const text: Record<Language, {
  nav: [string, string, string, string];
  language: string;
  heroEyebrow: string;
  heroTitle: string;
  heroBody: string;
  primaryCta: string;
  secondaryCta: string;
  heroNote: string;
  heroNoteSmall: string;
  heroStats: [string, string][];
  servicesKicker: string;
  servicesTitle: string;
  servicesBody: string;
  hubsKicker: string;
  hubsTitle: string;
  hubsBody: string;
  safetyKicker: string;
  safetyTitle: string;
  safetyBody: string;
  safetyNote: string;
  closingKicker: string;
  closingTitle: string;
  closingBody: string;
  contactCta: string;
  footerPhrase: string;
  footerNote: string;
}> = {
  ar: {
    nav: ["التجارب", "التضاريس", "السلامة", "الاستدامة"],
    language: "English",
    heroEyebrow: "دروب · عُمان البرّية",
    heroTitle: "رحلاتٌ غيرُ مألوفةٍ تتركُ بصمةً جلية.",
    heroBody: "من مغامرات المجموعات في رمال وهيبة، إلى الرحلات النسائية الحصرية، والمسارات الطويلة التي تعانق الجبل والبحر؛ نبتكر تجارب ميدانية تنبض بالكرم العُماني، وتتميز بتنظيم دقيق، واستعداد كامل لاحتضان الطبيعة.",
    primaryCta: "ابدأوا تصميم التجربة",
    secondaryCta: "استكشفوا الخدمات",
    heroNote: "من الكثيب إلى الساحل",
    heroNoteSmall: "برنامج ميداني · عُمان",
    heroStats: [["04", "أنماط تجربة"], ["03", "بيئات تشغيل"], ["24/7", "استعداد للميدان"]],
    servicesKicker: "مصفوفة التجارب",
    servicesTitle: "تفرض كل طبيعة جغرافية أسلوباً فريداً لبناء العمل الجماعي.",
    servicesBody: "حددي مسار رحلتكِ، ودعينا نبتكر لكِ إيقاعاً وضيافةً وتجهيزاتٍ ترتقي لتطلعاتكِ.",
    hubsKicker: "من أرض عُمان",
    hubsTitle: "ثلاث قواعد. امتداد واحد للمغامرة.",
     hubsBody: "من الكثبانِ الرمليةِ إلى قممِ الجبالِ وشواطئ البحر؛ نجمعُ في رحلاتنا بين الاحترافيةِ الميدانيةِ العاليةِ في ترويضِ التضاريس، وأصالةِ الضيافةِ التي تمنحكَ طمأنينةً وراحةً لا تُضاهى.",
    safetyKicker: "جاهزون للميدان",
     safetyTitle: "المغامرةُ الحقَّةُ لا تتركُ السَّلامةَ للصدفةِ.",
     safetyBody: "نُجهِّزُ القوافلَ ومساراتِ الشركاتِ باتصالاتٍ مستقلةٍ، وتتبُّعٍ دقيقٍ، وتجهيزاتِ إنقاذٍ وانتشالٍ صحراويٍّ، بفريقٍ يجمعُ خبرةَ القيادةِ على الطرقِ الوعرةِ، والإسعافِ، والغوصِ.",
    safetyNote: "تُحدَّد تفاصيل كل خطة دعم بحسب مسار التجربة وحجم المجموعة.",
    closingKicker: "لنرسم الدرب",
     closingTitle: "هل فريقُك، أو رحلتُكِ القادمة، مستعدٌّ لخوض غمار البرّية؟",
     closingBody: "دعنا نبدأ من هنا؛ شاركنا التغيير الذي تبحث عنه، سواء كان في إيقاع الرحلة، أو طبيعة التجربة، أو الفئة المستهدفة، لنصيغ معاً نقطة انطلاق جديدة تليق بهوية \"دروب\"",
    contactCta: "تواصلوا مع دروب",
    footerPhrase: "عُمان، كما تُعاش لا كما تُشاهد.",
    footerNote: "دروب © 2026",
  },
  en: {
    nav: ["Expeditions", "Terrain", "Safety", "Impact"],
    language: "العربية",
    heroEyebrow: "DUROOB · WILD OMAN",
    heroTitle: "Expeditions that move teams beyond the expected.",
    heroBody: "From Wahiba team challenges to women-exclusive retreats and long routes between mountain and sea, we build field experiences with Omani hospitality, measured pace, and genuine terrain readiness.",
    primaryCta: "Design your expedition",
    secondaryCta: "Explore services",
    heroNote: "From dune to coast",
    heroNoteSmall: "FIELD PROGRAMME · OMAN",
    heroStats: [["04", "Experience modes"], ["03", "Operating grounds"], ["24/7", "Field readiness"]],
    servicesKicker: "THE EXPEDITION MATRIX",
    servicesTitle: "Every terrain has its own way of building a team.",
    servicesBody: "Choose the expedition mode. We shape the rhythm, hospitality, and equipment around what the journey needs to accomplish.",
    hubsKicker: "OPERATING GROUND",
    hubsTitle: "Three terrain hubs. One extended fieldcraft.",
    hubsBody: "We move between desert, highland, and coast with operational fluency in the terrain and hospitality rooted in place.",
    safetyKicker: "READY TO DEPLOY",
    safetyTitle: "A good expedition never leaves safety to chance.",
    safetyBody: "Our corporate convoy routes are equipped with independent communication, precision tracking, and desert rescue and recovery equipment, supported by off-road drivers, medics, and divers.",
    safetyNote: "The support plan for every itinerary is scoped around its route and group size.",
    closingKicker: "DRAW THE ROUTE",
    closingTitle: "Is your team—or your next journey—ready to enter the wild?",
    closingBody: "Tell us what the experience should shift, and we will design the starting point from there.",
    contactCta: "Talk to Duroob",
    footerPhrase: "Oman, experienced—not merely observed.",
    footerNote: "DUROOB © 2026",
  },
};

const services: Array<{ icon: LucideIcon; number: string; tone: string; title: Bilingual; detail: Bilingual; audience: Bilingual }> = [
  {
    icon: Compass,
    number: "01",
    tone: "sand",
    title: { ar: "تحدي رمال وهيبة للمغامرات القصوى", en: "Extreme Wahiba Challenge" },
    detail: { ar: "تجربة عبور صحراوية متكاملة تمتد لعدة ليالٍ؛ نجمع فيها بين مهارات الملاحة بمركبات (4×4) بين الكثبان الرملية باستخدام أنظمة (GPS)، وتطبيق تقنيات إنقاذ السيارات بالروافع والمسارات الرملية.", en: "Multi-night desert crossings, 4×4 dune navigation, GPS mapping, and recovery simulations with winches and sand ladders." },
    audience: { ar: "مُصممةٌ لفرقِ العمل، والقياداتِ التنفيذية، وكوادرِ المواردِ البشرية.", en: "For corporate teams, HR leaders, and C-suite groups" },
  },
  {
    icon: UsersRound,
    number: "02",
    tone: "wadi",
    title: { ar: "رحلات نسائية حصرية", en: "Women-Exclusive Retreats" },
    detail: { ar: "رحلاتٌ برّيّة تُعلي من قيمة الخصوصية، وتديرها كوادر نسائية محترفة؛ لنضمن لكِ مغامرة آمنة ومطمئنة في الهواء الطلق.", en: "Privacy-led wilderness escapes, run exclusively by a professional female crew for a secure and confident outdoor experience." },
    audience: { ar: "للمجموعات النسائية في المنطقة", en: "For women’s groups across the region" },
  },
  {
    icon: Mountain,
    number: "03",
    tone: "rock",
    title: { ar: "من القمّة إلى الشاطئ", en: "Summit to Shore Overlanding" },
    detail: { ar: "مساراتٌ طويلةٌ تنحدرُ تدريجياً من قممِ الحجرِ الصخريةِ وصولاً إلى شواطئ الساحل العُمانيّ.", en: "Continuous multi-day descents from the rocky high plateaus of Al Hajar to Oman’s coastal waters." },
    audience: { ar: "مُخصّصةٌ للزوّارِ الدوليين وشغوفي المغامرة والتحمّل", en: "For international high-endurance travellers" },
  },
  {
    icon: ShipWheel,
    number: "04",
    tone: "coast",
    title: { ar: "هروب إلى البحر", en: "Maritime Escapes" },
    detail: { ar: "جولاتٌ سياحيةٌ متنوّعةٌ في صلالة، ورحلاتُ غوصٍ ممتعة، إلى جانبِ استكشافٍ شاملٍ للشريطِ الساحليِّ من الديمانياتِ إلى برّ الحكمان.", en: "Salalah tourism, diving trips, and coastal exploration from the Daymaniyat Islands to Bar Al Hikman." },
    audience: { ar: "للعائلات ومحبي البحر وعطلات نهاية الأسبوع", en: "For families, marine enthusiasts, and weekend explorers" },
  },
];

const hubs: Array<{ index: string; tag: Bilingual; name: Bilingual; detail: Bilingual; accent: string }> = [
  {
    index: "01",
    tag: { ar: "الصحراء", en: "DESERT" },
    name: { ar: "رمال وهيبة", en: "Wahiba Sands" },
     detail: { ar: "مخيماتُ عريشٍ مجهزةٌ بكاملِ سُبلِ الضيافة، تغفو فيها تحت سماءٍ صافية، لتبدأَ منها رحلتكَ في ترويضِ الكثبانِ الرملية.", en: "Fully catered mobile Areesh basecamps beneath clear moonlit skies, launching into the dune field." },
    accent: "hub-sand",
  },
  {
    index: "02",
    tag: { ar: "المرتفعات", en: "HIGHLANDS" },
     name: { ar: "الجبل  الأخضر   والحجر", en: "Al Hajar Highlands" },
     detail: { ar: "ملاذاتٌ تعانقُ الغيمَ في قممِ جبل شمس، وأوديةٌ تخفي أسرارها كـ \"وادي ضم\"؛ حيثُ تكتملُ مغامرةُ المسيرِ الجبليّ والتخييمِ في أحضانِ الطبيعةِ الباردة.", en: "High-altitude retreats across Jebel Shams and hidden wadis such as Wadi Damm, for technical trekking and cold-weather camping." },
    accent: "hub-rock",
  },
  {
    index: "03",
    tag: { ar: "الساحل", en: "COAST" },
     name: { ar: "بر الحكمان  وصلالة", en: "Bar Al Hikman & Salalah" },
     detail: { ar: "نطلق في مغامرات التخييم والاستكشاف الساحلي ببر الحكمان، مروراً برحلات صلالة الساحرة، ووصولاً إلى أعماق البحر عبر رحلات غوص احترافية..", en: "Coastal exploration at Bar Al Hikman—often called Oman’s Maldives by visitors—alongside Salalah tourism and diving trips." },
    accent: "hub-coast",
  },
];

const safetySystems: Array<{ icon: LucideIcon; label: Bilingual; detail: Bilingual }> = [
  { icon: Satellite, label: { ar: "اتصال مستقل", en: "Independent comms" }, detail: { ar: "هواتفُ أقمار صناعية وأجهزةُ تواصل لاسلكي", en: "Satellite phones" } },
  { icon: MapPinned, label: { ar: "تتبّع المسار", en: "Route tracking" }, detail: { ar: "جهزة تتبع وملاحة ميدانية (GPS)", en: "Field GPS trackers" } },
  { icon: Wrench, label: { ar: "إنقاذ واسترداد", en: "Rescue & recovery" }, detail: { ar: "دعمٌ صحراويّ، وتجهيزُ فريقِ إنقاذٍ محترفٍ للمركبات الرباعية (4x4)", en: "Desert support & heavy-duty gear" } },
  { icon: HeartPulse, label: { ar: "فريق ميداني", en: "Field specialists" }, detail: { ar: "سائقون، مسعفون، وغواصون في فريقٍ واحد", en: "Off-road drivers, medics & divers" } },
];

const specialistRoles: Bilingual[] = [
  { ar: "كفاءات متمرسة لقيادة آمنة في الطرق الوعرة", en: "Expert off-road drivers" },
  { ar: "مسعفون متمرسون في التضاريس", en: "Field medics" },
  { ar: "روّادُ استكشافِ الأعماقِ البحرية", en: "Expedition divers" },
];

const sustainabilityCopy: Record<Language, { kicker: string; title: string; body: string; note: string; pillars: Array<{ title: string; detail: string }> }> = {
  ar: {
    kicker: "الاستدامة · رؤية عُمان 2040",
    title: "مغامرةٌ تحفظ ودَّ الأرض التي نرتادها.",
    body: "تؤمن \"دروب\" بأن المغامرة المسؤولة شريك فاعل في مسيرة رؤية عُمان 2040، سعياً نحو هوية أصيلة ونابضة، وتنويع مستدام، وقيم سياحية طويلة المدى. لذا، لا نمر بالمكان مرور الكرام، بل نتخذه معلماً نتعلم منه في كل رحلة.",
    note: "مبادئ تشغيلية نعمل بها في تصميم الرحلات؛ وليست ادعاءً لشراكة أو اعتماد حكومي.",
    pillars: [
      { title: "نترك أثراً أخفَّ، لنحفظ جمال البر والبحر", detail: "نختار مسارات وتجهيزات صُمِّمت خصيصاً لحماية البيئات الصحراوية والساحلية الحساسة وصون هويتها." },
      { title: "ضيافةٌ نابعةٌ من جوهر الأرض وتفاصيلها.", detail: "نرى في المعرفة المحلية والضيافة العُمانية ركيزةً أساسية لا تكمل الرحلة إلا بهما." },
      { title: "استكشافٌ يُقدِّمُ المعرفة على الاستهلاك.", detail: "حوّل تفاصيل الملاحة وملامح الطبيعة وكنوز التراث إلى خبرات فهم مشتركة توحد بين الضيف والفريق." },
    ],
  },
  en: {
    kicker: "SUSTAINABILITY · OMAN VISION 2040",
    title: "Adventure that respects the ground that carries it.",
    body: "Duroob believes responsible adventure can contribute to the ambitions set out in Oman Vision 2040: a living local identity, sustainable diversification, and tourism with enduring value. Every journey is therefore a chance to learn from a place, rather than simply pass through it.",
    note: "Operating principles that inform our journey design; not a claim of government partnership or accreditation.",
    pillars: [
      { title: "Lighter by land and sea", detail: "We select routes and equipment with respect for sensitive desert and coastal environments." },
      { title: "Hospitality rooted in place", detail: "We value local knowledge and Omani hospitality as part of what makes a journey meaningful." },
      { title: "Learn before you consume", detail: "Navigation, nature, and heritage become shared moments of understanding for every guest and team." },
    ],
  },
};

const fieldExamples: Array<{ src: string; layout: string; label: Bilingual; alt: Bilingual }> = [
  { src: "/media/duroob-coastal-basecamp-pickup.jpg", layout: "gallery-card--coastal", label: { ar: "قاعدة ساحلية متحركة", en: "Mobile coastal base" }, alt: { ar: "مركبة مجهزة قرب ساحل عُمان", en: "Equipped vehicle beside the Omani coast" } },
  { src: "/media/duroob-coastal-basecamp-awning.jpg", layout: "gallery-card--awning", label: { ar: "تجهيز الميدان", en: "Field setup" }, alt: { ar: "تجهيز مخيم ميداني بجوار مركبة", en: "Field camp setup beside a vehicle" } },
  { src: "/media/duroob-coastal-basecamp.jpg", layout: "gallery-card--base", label: { ar: "مخيم ساحلي", en: "Coastal camp" }, alt: { ar: "مخيم ميداني على ساحل عُمان", en: "Field camp on the Omani coast" } },
  { src: "/media/duroob-coastal-heritage.jpg", layout: "gallery-card--heritage", label: { ar: "معالم الساحل", en: "Coastal landmarks" }, alt: { ar: "معلم طبيعي على ساحل عُمان", en: "Natural landmark on the Omani coast" } },
  { src: "/media/duroob-coastal-heritage-cabin.jpg", layout: "gallery-card--landmark", label: { ar: "ذاكرة المكان", en: "Sense of place" }, alt: { ar: "بناء خشبي ومعلم طبيعي ساحلي", en: "Wooden coastal structure and natural landmark" } },
  { src: "/media/duroob-areesh-camp.jpg", layout: "gallery-card--areesh", label: { ar: "ضيافة المخيم", en: "Camp hospitality" }, alt: { ar: "مخيم عريش في كثبان عُمان", en: "Areesh camp in Omani dunes" } },
  { src: "/media/duroob-route-planning-safe.jpg", layout: "gallery-card--route", label: { ar: "تخطيط المسار", en: "Route planning" }, alt: { ar: "مثال عام لتخطيط المسار الميداني", en: "General field route-planning example" } },
];

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Home() {
  const [language, setLanguage] = useState<Language>("ar");
  const copy = text[language];
  const sustainability = sustainabilityCopy[language];
  const isArabic = language === "ar";

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
    document.title = isArabic ? "دروب | مغامرات عُمان للفرق والشركات" : "Duroob | Oman Expeditions & Team Adventures";
  }, [isArabic, language]);

  return (
    <main className={`duroob-page ${isArabic ? "is-ar" : "is-en"}`} dir={isArabic ? "rtl" : "ltr"}>
      <section className="hero" id="top" aria-labelledby="hero-heading">
        <video className="hero-video" autoPlay muted loop playsInline poster="/media/duroob-hero-wadi.jpg" aria-hidden="true">
          <source src="/media/duroob-terrain-motion.mp4" type="video/mp4" />
        </video>
        <div className="hero-tint" aria-hidden="true" />
        <div className="hero-noise" aria-hidden="true" />

        <header className="site-header glass-panel">
          <a className="brand" href="#top" aria-label={isArabic ? "دروب — العودة إلى البداية" : "Duroob — back to top"}>
            <img src="/media/duroob-official-logo.png" alt={isArabic ? "شعار دروب" : "Duroob logo"} className="brand-mark" />
            <span className="brand-lockup"><strong>دروب</strong><small>DUROOB</small></span>
          </a>
          <nav className="top-nav" aria-label={isArabic ? "التنقل الرئيسي" : "Main navigation"}>
            <button type="button" onClick={() => scrollTo("services")}>{copy.nav[0]}</button>
            <button type="button" onClick={() => scrollTo("ground")}>{copy.nav[1]}</button>
            <button type="button" onClick={() => scrollTo("safety")}>{copy.nav[2]}</button>
            <button type="button" onClick={() => scrollTo("sustainability")}>{copy.nav[3]}</button>
          </nav>
          <button className="language-toggle" type="button" onClick={() => setLanguage(isArabic ? "en" : "ar")} aria-label={isArabic ? "Switch to English" : "التبديل إلى العربية"}>
            <span>{copy.language}</span><Radio size={15} strokeWidth={1.8} />
          </button>
        </header>

        <div className="hero-main">
          <aside className="hero-route glass-panel" aria-label={copy.heroNoteSmall}>
            <span className="route-code">23°35′N / 58°24′E</span>
            <i />
            <strong>{copy.heroNoteSmall}</strong>
          </aside>
          <figure className="hero-wadi-window">
            <img src="/media/duroob-wadi-window.jpg" alt={isArabic ? "مياه وصخور وادٍ عُماني" : "Water and rock in an Omani wadi"} />
            <figcaption><span>WADI / 01</span><i /></figcaption>
          </figure>
          <div className="hero-copy">
            <p className="eyebrow"><span />{copy.heroEyebrow}</p>
            <h1 id="hero-heading">{copy.heroTitle}</h1>
            <p className="hero-body">{copy.heroBody}</p>
            <div className="hero-actions">
              <button className="primary-cta" type="button" onClick={() => scrollTo("contact")}><span>{copy.primaryCta}</span>{isArabic ? <ArrowUpLeft size={19} /> : <ArrowUpRight size={19} />}</button>
              <button className="quiet-cta" type="button" onClick={() => scrollTo("services")}>{copy.secondaryCta}<ChevronDown size={18} /></button>
            </div>
          </div>
          <aside className="terrain-note glass-panel">
            <span className="terrain-note-index">FIELD / 01</span>
            <p>{copy.heroNote}</p>
            <div className="terrain-note-line"><i /><i /><i /></div>
          </aside>
        </div>

        <div className="hero-stats glass-panel">
          {copy.heroStats.map(([value, label]) => <div className="stat" key={label}><strong>{value}</strong><span>{label}</span></div>)}
          <div className="hero-stats-mark"><img src="/media/duroob-trail-knot-logo.png" alt={isArabic ? "رمز دروب الميداني للمسارات" : "Duroob field route symbol"} /></div>
        </div>
      </section>

      <section className="services-section" id="services" aria-labelledby="services-heading">
        <div className="section-layout">
          <div className="section-marker"><span>01</span><i /> <small>{isArabic ? "مصفوفة" : "MATRIX"}</small></div>
          <div className="section-intro">
            <p className="section-kicker">{copy.servicesKicker}</p>
            <h2 id="services-heading">{copy.servicesTitle}</h2>
            <p>{copy.servicesBody}</p>
          </div>
        </div>

        <div className="service-grid">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <article className={`service-card glass-panel service-card--${service.tone}`} key={service.number}>
                <div className="service-card-head"><span>{service.number}</span><Icon size={25} strokeWidth={1.4} /></div>
                <h3>{service.title[language]}</h3>
                <p>{service.detail[language]}</p>
                <div className="service-audience"><UsersRound size={15} strokeWidth={1.6} /><span>{service.audience[language]}</span></div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="team-section" aria-labelledby="team-heading">
        <div className="team-copy">
          <p className="section-kicker">{isArabic ? "فريق البرّية" : "THE FIELD CREW"}</p>
          <h2 id="team-heading">{isArabic ? "نُدير الأرض بفريقٍ يَخْبَرُ دروبها" : "We operate the terrain with people who know it."}</h2>
          <p>{isArabic ? "خلف كل قافلة خبرة عملية في قيادة الرمال، الاستجابة الميدانية، والرحلات البحرية. من دعم عمليات الإنقاذ والاسترداد الصحراوي إلى تنظيم الغوص، يجمع فريق دروب التخصّصات التي تتطلبها التضاريس." : "Behind every convoy is practical experience in sand driving, field response, and marine journeys. From desert rescue and recovery support to diving operations, Duroob brings the disciplines that terrain demands."}</p>
          <div className="specialist-roles">{specialistRoles.map((role, index) => <div key={role[language]}><span>0{index + 1}</span><strong>{role[language]}</strong></div>)}</div>
        </div>
        <div className="team-visuals" aria-label={isArabic ? "صور من قوافل دروب الصحراوية" : "Duroob desert convoy photographs"}>
          <figure className="team-photo team-photo-main"><img src="/media/duroob-desert-fleet.jpg" alt={isArabic ? "مركبات فريق دروب في الصحراء" : "Duroob team vehicles in the desert"} /><figcaption>{isArabic ? "قافلة ميدانية · رمال وهيبة" : "FIELD CONVOY · WAHIBA SANDS"}</figcaption></figure>
          <figure className="team-photo team-photo-secondary"><img src="/media/duroob-offroad-ready.jpg" alt={isArabic ? "مركبة مجهزة للطرق الوعرة في كثبان عُمان" : "An off-road-ready vehicle in Omani dunes"} /><figcaption>{isArabic ? "جاهزية 4×4" : "4×4 READY"}</figcaption></figure>
        </div>
      </section>

      <section className="ground-section" id="ground" aria-labelledby="ground-heading">
        <div className="ground-visual">
          <img src="/media/duroob-wadi-window.jpg" alt={isArabic ? "صخور ومياه أحد أودية عُمان" : "Rock and water in an Omani wadi"} />
          <div className="ground-visual-overlay" />
          <div className="ground-stamp glass-panel"><img src="/media/duroob-trail-knot-logo.png" alt={isArabic ? "ختم دروب للاستكشاف الميداني" : "Duroob field exploration stamp"} /><span>{isArabic ? "نقرأ الأرض" : "READ THE GROUND"}</span></div>
          <span className="ground-coordinates">WADI DAMM / AL HAJAR</span>
        </div>
        <div className="ground-content">
          <p className="section-kicker">{copy.hubsKicker}</p>
          <h2 id="ground-heading">{copy.hubsTitle}</h2>
          <p className="ground-intro">{copy.hubsBody}</p>
          <div className="hub-list">
            {hubs.map((hub) => <article className={`hub ${hub.accent}`} key={hub.index}>
              <div className="hub-index">{hub.index}</div>
              <div><span>{hub.tag[language]}</span><h3>{hub.name[language]}</h3><p>{hub.detail[language]}</p></div>
            </article>)}
          </div>
          <div className="itinerary-launcher">
            <p>{isArabic ? "استكشفوا التفاصيل قبل أن نرسم المسار." : "Explore the detail before we draw the route."}</p>
            <div>
              <Link to="/itineraries/bar-al-hikman">{isArabic ? "بر الحكمان" : "Bar Al Hikman"}</Link>
              <Link to="/itineraries/salalah">{isArabic ? "صلالة" : "Salalah"}</Link>
              <Link to="/itineraries/diving">{isArabic ? "رحلات الغوص" : "Diving trips"}</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="sustainability-section" id="sustainability" aria-labelledby="sustainability-heading">
        <div className="sustainability-heading-wrap">
          <span className="sustainability-index">04</span>
          <div>
            <p className="section-kicker">{sustainability.kicker}</p>
            <h2 id="sustainability-heading">{sustainability.title}</h2>
          </div>
        </div>
        <div className="sustainability-body">
          <p className="sustainability-lead">{sustainability.body}</p>
          <div className="sustainability-pillars">
            {sustainability.pillars.map((pillar, index) => <article className="sustainability-pillar" key={pillar.title}><span>0{index + 1}</span><div><h3>{pillar.title}</h3><p>{pillar.detail}</p></div></article>)}
          </div>
          <p className="sustainability-note">{sustainability.note}</p>
        </div>
      </section>

      <section className="examples-section" aria-labelledby="examples-heading">
        <div className="examples-heading-wrap">
          <div><p className="section-kicker">{isArabic ? "من الميدان" : "FROM THE FIELD"}</p><h2 id="examples-heading">{isArabic ? "أمثلة من الدروب التي نعيشها." : "Examples from the routes we live."}</h2><span className="evidence-stamp">EVIDENCE / 01—07</span></div>
          <p>{isArabic ? "مخيمات متنقلة تُنصب بحرصٍ بالغ، تمنح الدفء والراحة دون أن تترك خلفها سوى أثرٍ خفيف." : "Field photographs from coastal bases, mobile camps, desert equipment, and route-planning practice."}</p>
        </div>
        <div className="gallery-grid">
          {fieldExamples.map((example, index) => <figure className={`gallery-card ${example.layout}`} key={example.src}><img src={example.src} alt={example.alt[language]} /><figcaption><span><em>0{index + 1}</em>{example.label[language]}</span><i /></figcaption></figure>)}
        </div>
      </section>

      <section className="safety-section" id="safety" aria-labelledby="safety-heading">
        <div className="safety-topographic" aria-hidden="true"><svg viewBox="0 0 1440 400" preserveAspectRatio="none"><path d="M-30 256c123-163 239 59 367-59s244-79 372 22 191-43 300-77 202 64 403-119" /><path d="M-30 307c144-172 265 61 388-45s241-100 377 27 193-57 305-70 193 50 400-135" /><path d="M-30 365c165-145 270 33 411-55s247-115 384 22 195-43 320-86 216 26 385-95" /></svg></div>
        <div className="safety-title-block">
          <p className="section-kicker">{copy.safetyKicker}</p>
          <h2 id="safety-heading">{copy.safetyTitle}</h2>
          <p>{copy.safetyBody}</p>
        </div>
        <div className="safety-system-grid">
          {safetySystems.map((system, index) => {
            const Icon = system.icon;
            return <article className="safety-system glass-panel" key={system.label[language]}>
              <span className="system-number">0{index + 1}</span><Icon size={24} strokeWidth={1.45} />
              <div><h3>{system.label[language]}</h3><p>{system.detail[language]}</p></div>
            </article>;
          })}
        </div>
        <figure className="rescue-proof glass-panel">
          <img src="/media/duroob-yellow-recovery.jpg" alt={isArabic ? "مركبة دفع رباعي على كثيب رملي في عُمان" : "A four-wheel drive vehicle on an Omani sand dune"} />
           <figcaption><span>{isArabic ? "دعم صحراوي · 4×4" : "DESERT SUPPORT · 4×4"}</span><strong>{isArabic ? "استعدادٌ عمليّ لمسارات الاسترداد والإنقاذ" : "Practical readiness for recovery and rescue routes."}</strong></figcaption>
        </figure>
        <div className="safety-footnote"><ShieldCheck size={18} strokeWidth={1.5} /><span>{copy.safetyNote}</span></div>
      </section>

      <section className="closing-section" id="contact" aria-labelledby="contact-heading">
        <div className="closing-image"><img src="/media/duroob-desert-camp.jpg" alt={isArabic ? "مخيم في رمال وهيبة" : "A camp in Wahiba Sands"} /></div>
        <div className="closing-panel glass-panel">
          <p className="section-kicker">{copy.closingKicker}</p>
          <h2 id="contact-heading">{copy.closingTitle}</h2>
          <p>{copy.closingBody}</p>
          <div className="contact-details" aria-label={isArabic ? "بيانات التواصل مع دروب" : "Duroob contact details"}>
            {contacts.map((contact) => {
              const Icon = contact.icon;
              return <a className="contact-detail" href={contact.href} target={contact.external ? "_blank" : undefined} rel={contact.external ? "noreferrer" : undefined} key={contact.value}>
                <Icon size={18} strokeWidth={1.7} />
                <span className="contact-detail-label">{contact.label[language]}</span>
                <strong>{contact.value}</strong>
                {isArabic ? <ArrowUpLeft size={16} strokeWidth={1.7} /> : <ArrowUpRight size={16} strokeWidth={1.7} />}
              </a>;
            })}
          </div>
        </div>
        <footer className="site-footer">
          <a className="footer-brand" href="#top"><img src="/media/duroob-official-logo.png" alt={isArabic ? "شعار شركة دروب" : "Duroob company logo"} /><span>دروب <small>DUROOB</small></span></a>
          <p>{copy.footerPhrase}</p>
          <span>{copy.footerNote}</span>
        </footer>
      </section>
    </main>
  );
}
