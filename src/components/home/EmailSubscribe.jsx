import SubscribeForm from "./SubscribeForm";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

async function getSectionData() {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/home/email-subscribe-section/`,
      { cache: "no-store" }
    );

    const data = await res.json();

    if (data.success && data.data) return data.data;
  } catch (err) {
    console.error("Error fetching email subscribe section:", err);
  }

  return null;
}

export default async function EmailSubscribe() {

  const sectionData = await getSectionData();

  // defaults (same as yours)
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
    <section className="py-12 md:py-20 bg-gradient-to-r from-[#0F3C71] to-[#1A73E8]">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center space-y-4 md:space-y-6">

          {/* ✅ THIS IS NOW IN PAGE SOURCE */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white px-2">
            {title}
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-white/90 px-2">
            {subtitle}
          </p>

          {/* ONLY FORM IS CLIENT */}
          <SubscribeForm buttonText={buttonText} />

          <p className="text-sm text-white/80">
            {privacyText}
          </p>

        </div>
      </div>
    </section>
  );
}   