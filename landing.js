(function () {
  const API_BASE = "https://backendaianalysers.onrender.com";

  async function loadLandingPricing() {
    const priceEls = document.querySelectorAll("[data-price-label]");
    const compareEls = document.querySelectorAll("[data-compare-label]");
    const launchNoteEls = document.querySelectorAll("[data-launch-note]");

    let label = "$6.99";
    let compareAt = "$29/mo elsewhere";
    let launchNote = "One job. One payment. No subscription.";

    try {
      const res = await fetch(`${API_BASE}/api/resume/pricing`);
      if (res.ok) {
        const data = await res.json();
        if (data.priceLabel) label = data.priceLabel;
        if (data.compareAtLabel) compareAt = data.compareAtLabel;
        if (data.launchNote) launchNote = data.launchNote;
      }
    } catch (_) {
      /* keep defaults */
    }

    priceEls.forEach((el) => {
      el.textContent = label;
    });

    compareEls.forEach((el) => {
      el.textContent = compareAt;
    });

    launchNoteEls.forEach((el) => {
      el.textContent = launchNote;
    });
  }

  loadLandingPricing();
})();
