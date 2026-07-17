const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

function resolveInvoiceFilename(res, paymentId) {
  const disposition = res.headers.get("Content-Disposition") || "";
  const utf8Match = disposition.match(/filename\*\s*=\s*UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1].trim().replace(/["']/g, ""));
    } catch {
      // fall through
    }
  }

  const plainMatch = disposition.match(/filename\s*=\s*("?)([^";]+)\1/i);
  if (plainMatch?.[2]) {
    return plainMatch[2].trim();
  }

  return `invoice-${paymentId}.pdf`;
}

function triggerBrowserDownload(blob, filename) {
  // Legacy Edge / IE
  if (typeof window.navigator?.msSaveOrOpenBlob === "function") {
    window.navigator.msSaveOrOpenBlob(blob, filename);
    return;
  }

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  link.style.display = "none";
  document.body.appendChild(link);

  // Prefer a trusted click event so the browser treats this as a real download
  // (goes to Downloads) instead of a navigation/Save-As flow.
  link.dispatchEvent(
    new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      view: window,
    })
  );

  // Keep the object URL alive until the browser has started the download.
  window.setTimeout(() => {
    link.remove();
    window.URL.revokeObjectURL(url);
  }, 1500);
}

export async function downloadInvoice(paymentId) {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Please log in to download your invoice.");
  }
  if (!paymentId) {
    throw new Error("Payment ID is missing.");
  }

  const res = await fetch(
    `${API_BASE_URL}/api/enrollments/payment/${paymentId}/invoice/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/pdf",
      },
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error || "Failed to download invoice");
  }

  const filename = resolveInvoiceFilename(res, paymentId);
  const buffer = await res.arrayBuffer();

  // Force application/pdf so Chrome/Edge treat it as a direct download
  // instead of prompting a generic "Save As" for an unknown blob type.
  const blob = new Blob([buffer], { type: "application/pdf" });
  triggerBrowserDownload(blob, filename);
}
