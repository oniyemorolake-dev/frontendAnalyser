(function () {
  const API_BASE = "https://backendaianalysers.onrender.com";
  const form = document.getElementById("partnerForm");
  const statusEl = document.getElementById("partnerFormStatus");
  const submitBtn = document.getElementById("partnerSubmitBtn");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      name: document.getElementById("partnerName")?.value?.trim() || "",
      email: document.getElementById("partnerEmail")?.value?.trim() || "",
      organization: document.getElementById("partnerOrg")?.value?.trim() || "",
      orgType: document.getElementById("partnerType")?.value || "",
      clientsPerMonth: document.getElementById("partnerClients")?.value || "",
      message: document.getElementById("partnerMessage")?.value?.trim() || "",
    };

    if (submitBtn) submitBtn.disabled = true;
    if (statusEl) {
      statusEl.className = "fine-print";
      statusEl.textContent = "Sending...";
    }

    try {
      const res = await fetch(`${API_BASE}/api/resume/partner-inquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        if (statusEl) {
          statusEl.className = "fine-print payment-status error";
          statusEl.textContent = data.error || "Could not send inquiry.";
        }
        return;
      }

      if (statusEl) {
        statusEl.className = "fine-print";
        statusEl.textContent = data.message || "Thanks — we will be in touch.";
      }
      form.reset();

      if (typeof gtag === "function") {
        gtag("event", "partner_inquiry", { org_type: payload.orgType });
      }
    } catch (_) {
      if (statusEl) {
        statusEl.className = "fine-print payment-status error";
        statusEl.textContent = "Could not send right now. Email mowebsiteco@gmail.com instead.";
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
})();
