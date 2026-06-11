const LOCAL_BACKEND_HOSTS = new Set(["127.0.0.1", "localhost"]);

export function getApiBaseUrl() {
  const configured =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:8000";

  const normalized = configured.replace(/\/$/, "");

  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    try {
      const hostname = new URL(normalized).hostname;
      if (LOCAL_BACKEND_HOSTS.has(hostname)) {
        return "/backend-api";
      }
    } catch {
      // Fall through to configured URL.
    }
  }

  return normalized;
}

function toApiPath(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return normalizedPath.startsWith("/api/")
    ? normalizedPath
    : `/api${normalizedPath}`;
}

export function apiUrl(path) {
  const base = getApiBaseUrl();
  const apiPath = toApiPath(path);

  if (base === "/backend-api") {
    return `${base}${apiPath.replace(/^\/api/, "")}`;
  }

  return `${base}${apiPath}`;
}
