const form = document.getElementById("uploadForm");
const loading = document.getElementById("loading");
const loadingNote = document.getElementById("loadingNote");
const output = document.getElementById("output");
const analyzeBtn = document.getElementById("analyzeBtn");
const submitBtn = document.getElementById("submitBtn");
const analysisOutput = document.getElementById("analysisOutput");
const jobDescriptionInput = document.getElementById("jobDescription");
const paywallBox = document.getElementById("paywallBox");
const unlockBtn = document.getElementById("unlockBtn");
const sharePanel = document.getElementById("sharePanel");
const downloadCardBtn = document.getElementById("downloadCardBtn");
const copyShareBtn = document.getElementById("copyShareBtn");
const linkedinShareBtn = document.getElementById("linkedinShareBtn");
const twitterShareBtn = document.getElementById("twitterShareBtn");
const premiumBadge = document.getElementById("premiumBadge");
const scoreBadge = document.getElementById("scoreBadge");
const API_BASE = "https://backendaianalysers.onrender.com";
const UNLOCK_STORAGE_KEY = "motechco_unlock_token";

const ANALYSIS_PLACEHOLDER =
  "Your AI feedback will appear here after you upload a resume. Free users get a score + preview. Unlock the full report to monetize your job search.";

const COLD_START_NOTE =
  "First request after idle may take up to 60 seconds on the free tier.";

let latestAnalysis = null;
let pricing = { priceLabel: "$4.99", stripeConfigured: false };

analysisOutput.textContent = ANALYSIS_PLACEHOLDER;

function getUnlockToken() {
  return sessionStorage.getItem(UNLOCK_STORAGE_KEY) || "";
}

function setUnlockToken(token) {
  if (token) sessionStorage.setItem(UNLOCK_STORAGE_KEY, token);
  else sessionStorage.removeItem(UNLOCK_STORAGE_KEY);
}

function setLoading(active, message, note) {
  loading.style.display = active ? "block" : "none";
  loading.textContent = message || "Working...";
  loadingNote.style.display = active && note ? "block" : "none";
  if (note) loadingNote.textContent = note;
  submitBtn.disabled = active;
  analyzeBtn.disabled = active;
  if (unlockBtn) unlockBtn.disabled = active;
}

function renderSections(title, items) {
  if (!Array.isArray(items) || items.length === 0) return [];
  return [`${title}:`, ...items.map((item) => `  • ${item}`), ""];
}

function renderAnalysis(data) {
  if (data.raw) {
    return `Could not parse structured feedback.\n\nRaw model output:\n${data.raw}`;
  }

  const lines = [];

  if (typeof data.score === "number") {
    lines.push(`Overall Score: ${data.score}/100`, "");
  }

  if (typeof data.jobMatchScore === "number") {
    lines.push(`Job Match Score: ${data.jobMatchScore}/100`, "");
    if (data.jobFitSummary) {
      lines.push("Job Fit Summary:", `  ${data.jobFitSummary}`, "");
    }
  }

  lines.push(...renderSections("Strengths", data.strengths || data.strengthsPreview));

  if (data.tier === "free" && data.locked) {
    lines.push("Premium Preview Locked:", "  • Full weaknesses breakdown");
    lines.push("  • Complete ATS keyword list");
    lines.push("  • Formatting suggestions");
    lines.push("  • Job description match details", "");
    lines.push(data.upgradeMessage || `Unlock the full report for ${pricing.priceLabel}.`);
    return lines.join("\n").trim();
  }

  lines.push(...renderSections("Weaknesses", data.weaknesses));
  lines.push(...renderSections("Missing Keywords", data.missingKeywords));
  lines.push(...renderSections("Job Matched Keywords", data.jobMatchedKeywords));
  lines.push(...renderSections("Job Missing Keywords", data.jobMissingKeywords));
  lines.push(...renderSections("Formatting Suggestions", data.formattingSuggestions));

  if (lines.length === 0) return JSON.stringify(data, null, 2);
  return lines.join("\n").trim();
}

function updateResultsUi(data) {
  latestAnalysis = data;
  analysisOutput.textContent = renderAnalysis(data);
  analyzeBtn.style.display = "inline-block";

  if (typeof data.score === "number") {
    scoreBadge.hidden = false;
    scoreBadge.textContent = `${data.score}/100`;
  } else {
    scoreBadge.hidden = true;
  }

  const isPremium = data.tier === "premium" || data.locked === false;
  premiumBadge.hidden = !isPremium;
  paywallBox.hidden = isPremium;
  sharePanel.hidden = !isPremium;

  if (!isPremium && unlockBtn) {
    unlockBtn.textContent = `Unlock Full Report — ${pricing.priceLabel}`;
  }
}

function isValidResumeText(text) {
  return text && !text.startsWith("Please choose") && !text.startsWith("Upload failed");
}

async function loadPricing() {
  try {
    const res = await fetch(`${API_BASE}/api/resume/pricing`);
    if (res.ok) pricing = await res.json();
  } catch (_) {
    /* keep defaults */
  }

  if (unlockBtn) {
    unlockBtn.textContent = `Unlock Full Report — ${pricing.priceLabel}`;
  }
}

async function verifyPaymentFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("session_id");
  if (!sessionId) return;

  try {
    const res = await fetch(`${API_BASE}/api/resume/verify-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });
    const data = await res.json();
    if (res.ok && data.unlockToken) {
      setUnlockToken(data.unlockToken);
      premiumBadge.hidden = false;
      premiumBadge.textContent = "Premium unlocked";
      if (output.textContent.trim()) {
        await runAnalysis(output.textContent.trim());
      }
    }
  } catch (_) {
    /* ignore */
  } finally {
    params.delete("session_id");
    params.delete("canceled");
    const next = `${window.location.pathname}${params.toString() ? `?${params}` : ""}`;
    window.history.replaceState({}, "", next);
  }
}

async function startCheckout() {
  unlockBtn.disabled = true;
  unlockBtn.textContent = "Redirecting to secure checkout...";

  try {
    const res = await fetch(`${API_BASE}/api/resume/create-checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const data = await res.json();

    if (!res.ok || !data.url) {
      alert(data.detail || data.error || "Checkout is not available yet. Add Stripe keys on Render.");
      return;
    }

    window.location.href = data.url;
  } catch (_) {
    alert("Could not start checkout. Try again in a moment.");
  } finally {
    unlockBtn.disabled = false;
    unlockBtn.textContent = `Unlock Full Report — ${pricing.priceLabel}`;
  }
}

async function runAnalysis(resumeText) {
  if (!isValidResumeText(resumeText)) {
    analysisOutput.textContent = "Upload a resume first, then we'll analyze it automatically.";
    return false;
  }

  setLoading(true, "Step 2 of 2 — Analyzing your resume with AI...", COLD_START_NOTE);
  analysisOutput.textContent = "Generating AI feedback...";
  paywallBox.hidden = true;
  sharePanel.hidden = true;

  const payload = {
    text: resumeText,
    jobDescription: jobDescriptionInput.value.trim(),
    unlockToken: getUnlockToken(),
  };

  try {
    const res = await fetch(`${API_BASE}/api/resume/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      const detail = data.detail ? `\n\nDetails: ${data.detail}` : "";
      analysisOutput.textContent = `${data.error || "Analysis failed."}${detail}\n\nClick "Re-analyze" to try again.`;
      return false;
    }

    updateResultsUi(data);
    return true;
  } catch (_) {
    analysisOutput.textContent =
      'Analysis failed. The backend may be waking up — wait about 60 seconds, then click "Re-analyze".';
    return false;
  } finally {
    setLoading(false);
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fileInput = document.getElementById("resume");
  if (!fileInput.files[0]) {
    output.textContent = "Please choose a file first.";
    return;
  }

  setLoading(true, "Step 1 of 2 — Uploading and extracting text...", COLD_START_NOTE);
  output.textContent = "";
  analysisOutput.textContent = "Waiting for extracted text...";
  analyzeBtn.style.display = "none";
  paywallBox.hidden = true;
  sharePanel.hidden = true;
  scoreBadge.hidden = true;

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  let resumeText = "";

  try {
    const res = await fetch(`${API_BASE}/api/resume/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      output.textContent = data.error || `Upload failed (${res.status}).`;
      analysisOutput.textContent = ANALYSIS_PLACEHOLDER;
      return;
    }

    resumeText = data.text || data.content || "Upload completed, but no text was extracted.";
    output.textContent = resumeText;
    output.scrollLeft = 0;
  } catch (_) {
    output.textContent = "Upload failed. The backend may be waking up — try again in a moment.";
    analysisOutput.textContent = ANALYSIS_PLACEHOLDER;
    return;
  } finally {
    setLoading(false);
  }

  await runAnalysis(resumeText.trim());
});

analyzeBtn.addEventListener("click", async () => {
  await runAnalysis(output.textContent.trim());
});

if (unlockBtn) unlockBtn.addEventListener("click", startCheckout);

if (downloadCardBtn) {
  downloadCardBtn.addEventListener("click", () => {
    if (!latestAnalysis) return;
    window.MoTechCoShare.downloadScoreCard(latestAnalysis);
  });
}

if (copyShareBtn) {
  copyShareBtn.addEventListener("click", async () => {
    if (!latestAnalysis) return;
    const text = window.MoTechCoShare.buildShareText(latestAnalysis);
    try {
      await navigator.clipboard.writeText(text);
      copyShareBtn.textContent = "Copied!";
      setTimeout(() => {
        copyShareBtn.textContent = "Copy Share Text";
      }, 1800);
    } catch (_) {
      alert(text);
    }
  });
}

if (linkedinShareBtn) {
  linkedinShareBtn.addEventListener("click", () => {
    if (!latestAnalysis) return;
    const text = window.MoTechCoShare.buildShareText(latestAnalysis);
    window.open(window.MoTechCoShare.getLinkedInShareUrl(text), "_blank", "noopener");
  });
}

if (twitterShareBtn) {
  twitterShareBtn.addEventListener("click", () => {
    if (!latestAnalysis) return;
    const text = window.MoTechCoShare.buildShareText(latestAnalysis);
    window.open(window.MoTechCoShare.getTwitterShareUrl(text), "_blank", "noopener");
  });
}

loadPricing();
verifyPaymentFromUrl();
