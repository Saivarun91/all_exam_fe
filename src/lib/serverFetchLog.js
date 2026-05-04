/**
 * Suppress expected build-time/server fetch noise (API offline, dynamic/static mismatch)
 * while still logging unexpected issues.
 */
export function isExpectedServerFetchIssue(error) {
  const code = error?.cause?.code || error?.code;
  const digest = error?.digest;
  const message = String(error?.message || "");
  const description = String(error?.description || "");

  if (
    code === "ECONNREFUSED" ||
    code === "ENOTFOUND" ||
    code === "ECONNRESET" ||
    code === "ETIMEDOUT"
  ) {
    return true;
  }

  if (
    digest === "DYNAMIC_SERVER_USAGE" ||
    message.includes("Dynamic server usage") ||
    description.includes("Dynamic server usage")
  ) {
    return true;
  }

  return false;
}

export function logServerFetchError(label, error) {
  if (isExpectedServerFetchIssue(error)) return;
  console.error(label, error);
}
