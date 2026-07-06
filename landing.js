(function () {
  const API_BASE = "https://backendaianalysers.onrender.com";

  async function loadLandingPricing() {
    const priceEls = document.querySelectorAll("[data-price-label]");
    if (priceEls.length === 0) return;

    let label = "$4.99";
    try {
      const res = await fetch(`${API_BASE}/api/resume/pricing`);
      if (res.ok) {
        const data = await res.json();
        if (data.priceLabel) label = data.priceLabel;
      }
    } catch (_) {
      /* keep default */
    }

    priceEls.forEach((el) => {
      el.textContent = label;
    });
  }

  loadLandingPricing();
})();
