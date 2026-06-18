const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

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
      },
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error || "Failed to download invoice");
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `invoice-${paymentId}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
