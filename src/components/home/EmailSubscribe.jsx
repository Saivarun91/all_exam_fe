import EmailSubscribeClient from "./EmailSubscribeClient";

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
    <EmailSubscribeClient
      title={title}
      subtitle={subtitle}
      buttonText={buttonText}
      privacyText={privacyText}
    />
  );
}