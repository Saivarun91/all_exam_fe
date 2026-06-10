import SubscribeForm from "./SubscribeForm";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

async function getSectionData() {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/home/email-subscribe-section/`,
      { next: { revalidate: 300 } }
    );

    const data = await res.json();

    if (data.success && data.data) return data.data;
  } catch (err) {}

  return null;
}

export default async function EmailSubscribe() {
  const sectionData = await getSectionData();

  const title =
    sectionData?.title || "Get Free Weekly Exam Updates";

  const subtitle =
    sectionData?.subtitle ||
    "Latest dumps, new questions & exam alerts delivered to your inbox";

  const buttonText =
    sectionData?.button_text || "Subscribe";

  const privacyText =
    sectionData?.privacy_text ||
    "No spam. Unsubscribe anytime. Your privacy is protected.";

  return (
    <section className="relative py-12 md:py-20 overflow-hidden bg-gradient-to-r from-[#1E1B4B] via-[#312E81] to-[#4C1D95]">
      
      {/* soft glow background */}
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.15),transparent_60%)]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-4 md:space-y-6">

          {/* Title */}
          <h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-white px-2"
            data-i18n="home.subscribe.title"
            data-i18n-fallback={title}
          >
            {title}
          </h2>

          {/* Subtitle */}
          <p
            className="text-base sm:text-lg md:text-xl text-white/80 px-2"
            data-i18n="home.subscribe.subtitle"
            data-i18n-fallback={subtitle}
          >
            {subtitle}
          </p>

          {/* Form (unchanged) */}
          <SubscribeForm buttonText={buttonText} />

          {/* Privacy text */}
          <p
            className="text-sm text-white/70"
            data-i18n="home.subscribe.privacy"
            data-i18n-fallback="No spam. Unsubscribe anytime. Your privacy is protected."
          >
            {privacyText}
          </p>

        </div>
      </div>
    </section>
  );
}