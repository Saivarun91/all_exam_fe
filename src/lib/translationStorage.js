import { normalizeLanguageCode } from "@/lib/supportedLocales";



const STORAGE_KEY = "siteTranslationsV1";



function readStore() {

  if (typeof window === "undefined") return {};



  try {

    const raw = localStorage.getItem(STORAGE_KEY);

    return raw ? JSON.parse(raw) : {};

  } catch {

    return {};

  }

}



function writeStore(store) {

  if (typeof window === "undefined") return;



  try {

    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));

  } catch {

    // Ignore quota errors.

  }

}



function storageCode(langCode) {

  return normalizeLanguageCode(langCode);

}



export function loadStoredApiLayer(langCode) {

  const code = storageCode(langCode);

  const layer = readStore()[code];

  return layer && typeof layer === "object" ? layer : null;

}



export function saveStoredApiLayer(langCode, apiLayer) {

  const code = storageCode(langCode);

  if (!code || !apiLayer || typeof apiLayer !== "object") return;



  const store = readStore();

  store[code] = {

    ...(store[code] && typeof store[code] === "object" ? store[code] : {}),

    ...apiLayer,

  };

  writeStore(store);

}



export function clearStoredApiLayer(langCode) {

  if (!langCode) {

    writeStore({});

    return;

  }



  const code = storageCode(langCode);

  const store = readStore();

  delete store[code];

  writeStore(store);

}


