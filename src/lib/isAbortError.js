/** True when a fetch was cancelled (navigation, unmount, timeout, new request). */
export function isAbortError(error) {
  if (!error) return false;
  if (error.name === "AbortError") return true;
  const message = String(error.message || error);
  return /aborted/i.test(message);
}
