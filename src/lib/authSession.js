const BULKY_EXACT_KEYS = ["siteTranslationsV1", "pageRuntimeV1"];
const BULKY_PREFIXES = ["pageMetaV1:"];

export function clearBulkyLocalStorageCaches() {
  if (typeof window === "undefined") return;

  try {
    BULKY_EXACT_KEYS.forEach((key) => localStorage.removeItem(key));

    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key && BULKY_PREFIXES.some((prefix) => key.startsWith(prefix))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch {
    // Ignore storage cleanup errors.
  }
}

function safeSetItem(key, value) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(key, value);
    return;
  } catch (error) {
    if (error?.name !== "QuotaExceededError") {
      throw error;
    }
  }

  clearBulkyLocalStorageCaches();

  try {
    localStorage.setItem(key, value);
    return;
  } catch (error) {
    if (error?.name !== "QuotaExceededError") {
      throw error;
    }
  }

  // profile_picture is write-only in localStorage and can be very large base64.
  localStorage.removeItem("profile_picture");
  localStorage.setItem(key, value);
}

export function persistUserAuthSession({ token, user = {} }) {
  if (!token) return;

  clearBulkyLocalStorageCaches();
  safeSetItem("token", token);
  safeSetItem("name", user.fullname || "");
  safeSetItem("email", user.email || "");
  safeSetItem("role", user.role || "student");
  safeSetItem("isLoggedIn", "true");
}
