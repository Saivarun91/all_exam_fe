import { isEnglishLanguage } from "@/lib/defaultTranslations";
import { toTranslateLanguageCode } from "@/lib/translateLanguageCode";

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Known brand, product, and place-name localizations applied after runtime
 * translation when the API leaves English tokens unchanged.
 */
const TERM_LOCALIZATIONS = {
  hi: {
    Google: "गूगल",
    "Google Cloud": "गूगल क्लाउड",
    Microsoft: "माइक्रोसॉफ्ट",
    "Microsoft Azure": "माइक्रोसॉफ्ट एज़्योर",
    Azure: "एज़्योर",
    Amazon: "अमेज़न",
    AWS: "एडब्ल्यूएस",
    "Amazon Web Services": "अमेज़न वेब सर्विसेज",
    ServiceNow: "सर्विसनाउ",
    Salesforce: "सेल्सफोर्स",
    Cisco: "सिस्को",
    Oracle: "ओरेकल",
    VMware: "वीएमवेयर",
    CompTIA: "कॉम्पटिया",
    GCP: "जीसीपी",
    "Google Cloud Platform": "गूगल क्लाउड प्लेटफ़ॉर्म",
    SAP: "एसएपी",
    ITIL: "आईटीआईएल",
    PMP: "पीएमपी",
    Scrum: "स्क्रम",
    Agile: "एजाइल",
    NetApp: "नेटऐप",
    "Red Hat": "रेड हैट",
    Kubernetes: "कुबेरनेट्स",
    DevOps: "डेवऑप्स",
    Snowflake: "स्नोफ्लेक",
    Splunk: "स्प्लंक",
    Palo: "पालो",
    Fortinet: "फोर्टिनेट",
    HashiCorp: "हैशीकॉर्प",
    Terraform: "टेराफॉर्म",
    Docker: "डॉकर",
    Linux: "लिनक्स",
    Python: "पायथन",
    Java: "जावा",
    JavaScript: "जावास्क्रिप्ट",
    TypeScript: "टाइपस्क्रिप्ट",
    GitHub: "गिटहब",
    GitLab: "गिटलैब",
    LinkedIn: "लिंक्डइन",
    Facebook: "फेसबुक",
    Twitter: "ट्विटर",
    YouTube: "यूट्यूब",
    Instagram: "इंस्टाग्राम",
    India: "भारत",
    Hyderabad: "हैदराबाद",
    Telangana: "तेलंगाना",
    Gopanpally: "गोपनपल्ली",
    Apartment: "अपार्टमेंट",
    Apt: "अपार्टमेंट",
    Private: "प्राइवेट",
    Limited: "लिमिटेड",
  },
  "zh-CN": {
    Google: "谷歌",
    "Google Cloud": "谷歌云",
    Microsoft: "微软",
    "Microsoft Azure": "微软 Azure",
    Azure: "Azure",
    Amazon: "亚马逊",
    AWS: "AWS",
    "Amazon Web Services": "亚马逊网络服务",
    ServiceNow: "赛维士诺",
    GCP: "谷歌云",
    SAP: "思爱普",
    Salesforce: "Salesforce",
    Cisco: "思科",
    Oracle: "甲骨文",
    VMware: "VMware",
    CompTIA: "CompTIA",
    Kubernetes: "Kubernetes",
    DevOps: "DevOps",
    India: "印度",
    Hyderabad: "海得拉巴",
    Telangana: "特伦甘纳邦",
    Gopanpally: "戈潘帕利",
    Apartment: "公寓",
    Apt: "公寓",
    Private: "私人",
    Limited: "有限公司",
  },
  "zh-TW": {
    Google: "谷歌",
    "Google Cloud": "Google 雲端",
    Microsoft: "微軟",
    Azure: "Azure",
    Amazon: "亞馬遜",
    AWS: "AWS",
    ServiceNow: "ServiceNow",
    India: "印度",
    Hyderabad: "海得拉巴",
    Telangana: "特倫甘納邦",
  },
  fr: {
    Google: "Google",
    "Google Cloud": "Google Cloud",
    Microsoft: "Microsoft",
    Azure: "Azure",
    Amazon: "Amazon",
    AWS: "AWS",
    ServiceNow: "ServiceNow",
    India: "Inde",
    Hyderabad: "Hyderabad",
    Telangana: "Telangana",
  },
  es: {
    Google: "Google",
    Microsoft: "Microsoft",
    Azure: "Azure",
    Amazon: "Amazon",
    AWS: "AWS",
    ServiceNow: "ServiceNow",
    India: "India",
    Hyderabad: "Hyderabad",
    Telangana: "Telangana",
  },
  de: {
    Google: "Google",
    Microsoft: "Microsoft",
    Azure: "Azure",
    Amazon: "Amazon",
    AWS: "AWS",
    ServiceNow: "ServiceNow",
    India: "Indien",
    Hyderabad: "Hyderabad",
    Telangana: "Telangana",
  },
  ja: {
    Google: "グーグル",
    Microsoft: "マイクロソフト",
    Azure: "Azure",
    Amazon: "アマゾン",
    AWS: "AWS",
    ServiceNow: "ServiceNow",
    India: "インド",
    Hyderabad: "ハイデラバード",
    Telangana: "テランガナ州",
  },
  ko: {
    Google: "구글",
    Microsoft: "마이크로소프트",
    Azure: "Azure",
    Amazon: "아마존",
    AWS: "AWS",
    ServiceNow: "ServiceNow",
    India: "인도",
    Hyderabad: "하이데라바드",
    Telangana: "텔랑가나",
  },
  ar: {
    Google: "جوجل",
    Microsoft: "مايكروسوفت",
    Azure: "أزور",
    Amazon: "أمازون",
    AWS: "AWS",
    ServiceNow: "ServiceNow",
    India: "الهند",
    Hyderabad: "حيدر أباد",
    Telangana: "تيلانغانا",
  },
  ta: {
    Google: "கூகிள்",
    Microsoft: "மைக்ரோசாப்ட்",
    Azure: "அஜூர்",
    Amazon: "அமேசான்",
    AWS: "AWS",
    ServiceNow: "சர்வீஸ்நோ",
    India: "இந்தியா",
    Hyderabad: "ஹைதராபாத்",
    Telangana: "தெலங்கானா",
  },
  te: {
    Google: "గూగుల్",
    Microsoft: "మైక్రోసాఫ్ట్",
    Azure: "అజూర్",
    Amazon: "అమెజాన్",
    AWS: "AWS",
    ServiceNow: "సర్వీస్‌నౌ",
    India: "భారతదేశం",
    Hyderabad: "హైదరాబాద్",
    Telangana: "తెలంగాణ",
  },
  bn: {
    Google: "গুগল",
    Microsoft: "মাইক্রোসফ্ট",
    Azure: "অ্যাজুর",
    Amazon: "আমাজন",
    AWS: "AWS",
    ServiceNow: "সার্ভিসনাউ",
    India: "ভারত",
    Hyderabad: "হায়দরাবাদ",
    Telangana: "তেলেঙ্গানা",
  },
  mr: {
    Google: "गूगल",
    Microsoft: "मायक्रोसॉफ्ट",
    Azure: "अझूर",
    Amazon: "अॅमेझॉन",
    AWS: "AWS",
    ServiceNow: "सर्विसनाउ",
    India: "भारत",
    Hyderabad: "हैदराबाद",
    Telangana: "तेलंगणा",
  },
  gu: {
    Google: "ગૂગલ",
    Microsoft: "માઇક્રોસોફ્ટ",
    Azure: "એઝ્યોર",
    Amazon: "એમેઝોન",
    AWS: "AWS",
    ServiceNow: "સર્વિસનાઉ",
    India: "ભારત",
    Hyderabad: "હૈદરાબાદ",
    Telangana: "તેલંગાણા",
  },
  kn: {
    Google: "ಗೂಗಲ್",
    Microsoft: "ಮೈಕ್ರೋಸಾಫ್ಟ್",
    Azure: "ಅಜೂರ್",
    Amazon: "ಅಮೆಜಾನ್",
    AWS: "AWS",
    ServiceNow: "ಸರ್ವೀಸ್‌ನೌ",
    India: "ಭಾರತ",
    Hyderabad: "ಹೈದರಾಬಾದ್",
    Telangana: "ತೆಲಂಗಾಣ",
  },
  ml: {
    Google: "ഗൂഗിൾ",
    Microsoft: "മൈക്രോസോഫ്റ്റ്",
    Azure: "അസൂർ",
    Amazon: "ആമസോൺ",
    AWS: "AWS",
    ServiceNow: "സർവീസ്നൗ",
    India: "ഇന്ത്യ",
    Hyderabad: "ഹൈദരാബാദ്",
    Telangana: "തെലങ്കാന",
  },
  pa: {
    Google: "ਗੂਗਲ",
    Microsoft: "ਮਾਈਕਰੋਸਾਫਟ",
    Azure: "ਐਜ਼ੁਰ",
    Amazon: "ਐਮਾਜ਼ਾਨ",
    AWS: "AWS",
    ServiceNow: "ਸਰਵਿਸਨਾਉ",
    India: "ਭਾਰਤ",
    Hyderabad: "ਹੈਦਰਾਬਾਦ",
    Telangana: "ਤੇਲੰਗਾਨਾ",
  },
  ur: {
    Google: "گوگل",
    Microsoft: "مائیکروسافٹ",
    Azure: "ازور",
    Amazon: "ایمیزون",
    AWS: "AWS",
    ServiceNow: "سروس ناؤ",
    India: "بھارت",
    Hyderabad: "حیدرآباد",
    Telangana: "تلنگانہ",
  },
  pt: {
    Google: "Google",
    Microsoft: "Microsoft",
    Azure: "Azure",
    Amazon: "Amazon",
    AWS: "AWS",
    ServiceNow: "ServiceNow",
    India: "Índia",
    Hyderabad: "Hyderabad",
    Telangana: "Telangana",
  },
  it: {
    Google: "Google",
    Microsoft: "Microsoft",
    Azure: "Azure",
    Amazon: "Amazon",
    AWS: "AWS",
    ServiceNow: "ServiceNow",
    India: "India",
    Hyderabad: "Hyderabad",
    Telangana: "Telangana",
  },
  ru: {
    Google: "Google",
    Microsoft: "Microsoft",
    Azure: "Azure",
    Amazon: "Amazon",
    AWS: "AWS",
    ServiceNow: "ServiceNow",
    India: "Индия",
    Hyderabad: "Хайдарабад",
    Telangana: "Телангана",
  },
};

const sortedTermCache = new Map();

function getSortedTerms(language) {
  const target = toTranslateLanguageCode(language);
  const table = TERM_LOCALIZATIONS[target] || TERM_LOCALIZATIONS[target.split("-")[0]];
  if (!table) return [];

  const cacheKey = target;
  if (sortedTermCache.has(cacheKey)) {
    return sortedTermCache.get(cacheKey);
  }

  const sorted = Object.entries(table).sort(
    ([left], [right]) => right.length - left.length
  );
  sortedTermCache.set(cacheKey, sorted);
  return sorted;
}

export function applyTermLocalizations(text, language) {
  const value = (text || "").trim();
  if (!value || isEnglishLanguage(language)) return text || "";

  const terms = getSortedTerms(language);
  if (!terms.length) return text || "";

  let result = text;
  for (const [english, localized] of terms) {
    if (!english || !localized) continue;
    const pattern = new RegExp(`\\b${escapeRegExp(english)}\\b`, "gi");
    result = result.replace(pattern, localized);
  }

  return result;
}

export function localizeRuntimeTranslation(source, translated, language) {
  const src = (source || "").trim();
  if (!src || isEnglishLanguage(language)) return translated || source || "";

  const fromApi = (translated || "").trim();
  const base = fromApi && fromApi !== src ? fromApi : src;
  const localized = applyTermLocalizations(base, language);

  if (localized && localized !== src) {
    return localized;
  }

  return fromApi || src;
}
