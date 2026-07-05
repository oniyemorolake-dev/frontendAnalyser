const form = document.getElementById("uploadForm");
const loading = document.getElementById("loading");
const loadingNote = document.getElementById("loadingNote");
const output = document.getElementById("output");
const analyzeBtn = document.getElementById("analyzeBtn");
const submitBtn = document.getElementById("submitBtn");
const analysisOutput = document.getElementById("analysisOutput");
const scoreHero = document.getElementById("scoreHero");
const scoreHeroRing = document.getElementById("scoreHeroRing");
const scoreHeroValue = document.getElementById("scoreHeroValue");
const jobDescriptionInput = document.getElementById("jobDescription");
const paywallBox = document.getElementById("paywallBox");
const unlockBtn = document.getElementById("unlockBtn");
const paymentStatus = document.getElementById("paymentStatus");
const rewritePanel = document.getElementById("rewritePanel");
const rewriteBtn = document.getElementById("rewriteBtn");
const rewriteOutput = document.getElementById("rewriteOutput");
const rewriteStatus = document.getElementById("rewriteStatus");
const rewriteLocked = document.getElementById("rewriteLocked");
const rewriteTools = document.getElementById("rewriteTools");
const rewritePremiumTag = document.getElementById("rewritePremiumTag");
const rewriteUnlockBtn = document.getElementById("rewriteUnlockBtn");
const copyRewriteBtn = document.getElementById("copyRewriteBtn");
const downloadRewriteBtn = document.getElementById("downloadRewriteBtn");
const contactHelpText = document.getElementById("contactHelpText");
const contactEmailLink = document.getElementById("contactEmailLink");
const sharePanel = document.getElementById("sharePanel");
const emailPanel = document.getElementById("emailPanel");
const jobMatchPanel = document.getElementById("jobMatchPanel");
const jobFitSummary = document.getElementById("jobFitSummary");
const matchedKeywords = document.getElementById("matchedKeywords");
const missingJobKeywords = document.getElementById("missingJobKeywords");
const referralLink = document.getElementById("referralLink");
const copyReferralBtn = document.getElementById("copyReferralBtn");
const referralStatus = document.getElementById("referralStatus");
const downloadCardBtn = document.getElementById("downloadCardBtn");
const downloadReportBtn = document.getElementById("downloadReportBtn");
const printReportBtn = document.getElementById("printReportBtn");
const copyShareBtn = document.getElementById("copyShareBtn");
const linkedinShareBtn = document.getElementById("linkedinShareBtn");
const twitterShareBtn = document.getElementById("twitterShareBtn");
const emailInput = document.getElementById("emailInput");
const emailReportBtn = document.getElementById("emailReportBtn");
const emailStatus = document.getElementById("emailStatus");
const emailHelpText = document.getElementById("emailHelpText");
const premiumBadge = document.getElementById("premiumBadge");

const API_BASE = "https://backendaianalysers.onrender.com";
const SITE_URL = "https://resume.motechco.ca";
const UNLOCK_STORAGE_KEY = "motechco_unlock_token";
const PAID_SESSION_KEY = "motechco_paid_session";
const RESUME_STORAGE_KEY = "motechco_resume_text";
const JOB_STORAGE_KEY = "motechco_job_text";
const REF_CODE_STORAGE_KEY = "motechco_ref_code";
const DEVICE_ID_STORAGE_KEY = "motechco_device_id";

const OUTPUT_PLACEHOLDER = "Upload a resume to see extracted text here.";

const ANALYSIS_PLACEHOLDER =
  "Your AI feedback will appear here after you upload a resume.";

const COLD_START_NOTE =
  "First request after idle may take up to 60 seconds on the free hosting tier.";

const ANALYZE_TIMEOUT_MS = 90000;

async function fetchWithTimeout(url, options, timeoutMs = ANALYZE_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

let latestAnalysis = null;
let latestRewrite = "";
let pricing = { priceLabel: "$4.99", stripeConfigured: false };
let emailDeliveryEnabled = false;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderSections(title, items) {
  if (!Array.isArray(items) || items.length === 0) return [];
  return [`${title}:`, ...items.map((item) => `  • ${item}`), ""];
}

function renderAnalysis(data, forExport = false) {
  if (data.raw) {
    return `Could not parse structured feedback.\n\nRaw model output:\n${data.raw}`;
  }

  const lines = [`MoTechCo Resume Analyzer Report`, ""];

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

  if (data.tier === "free" && data.locked && !forExport) {
    lines.push("Premium Preview Locked:", "  • Full weaknesses breakdown");
    lines.push("  • Complete ATS keyword list");
    lines.push("  • Formatting suggestions");
    lines.push("  • Job description match details", "");
    lines.push(data.upgradeMessage || `Unlock the full report for ${pricing.priceLabel}.`);
    lines.push("", "Click the unlock button below to pay securely with Stripe.");
    return lines.join("\n").trim();
  }

  lines.push(...renderSections("Weaknesses", data.weaknesses));
  lines.push(...renderSections("Missing Keywords", data.missingKeywords));
  lines.push(...renderSections("Job Matched Keywords", data.jobMatchedKeywords));
  lines.push(...renderSections("Job Missing Keywords", data.jobMissingKeywords));
  lines.push(...renderSections("Formatting Suggestions", data.formattingSuggestions));
  lines.push("", SITE_URL);

  if (lines.length <= 3) return JSON.stringify(data, null, 2);
  return lines.join("\n").trim();
}

function showAnalysisMessage(message) {
  analysisOutput.textContent = message;
}

function getDeviceId() {
  let id = localStorage.getItem(DEVICE_ID_STORAGE_KEY);
  if (!id) {
    id = `dev_${Math.random().toString(36).slice(2)}_${Date.now()}`;
    localStorage.setItem(DEVICE_ID_STORAGE_KEY, id);
  }
  return id;
}

function getMyReferralCode() {
  let code = localStorage.getItem(REF_CODE_STORAGE_KEY);
  if (!code) {
    code = Math.random().toString(36).slice(2, 10).toLowerCase();
    localStorage.setItem(REF_CODE_STORAGE_KEY, code);
  }
  return code;
}

function getReferralShareUrl() {
  return `${SITE_URL}/index.html?ref=${getMyReferralCode()}`;
}

function setupReferralLinkField() {
  if (referralLink) referralLink.value = getReferralShareUrl();
}

function getUnlockToken() {
  return (
    sessionStorage.getItem(UNLOCK_STORAGE_KEY) ||
    localStorage.getItem(PAID_SESSION_KEY) ||
    ""
  );
}

function setUnlockToken(token) {
  if (token) {
    sessionStorage.setItem(UNLOCK_STORAGE_KEY, token);
    localStorage.setItem(PAID_SESSION_KEY, token);
  } else {
    sessionStorage.removeItem(UNLOCK_STORAGE_KEY);
    localStorage.removeItem(PAID_SESSION_KEY);
  }
}

function applyPremiumUi(sourceLabel) {
  premiumBadge.hidden = false;
  premiumBadge.textContent =
    sourceLabel === "referral" ? "Referral premium unlocked" : "Premium unlocked";
  premiumBadge.title =
    "Full report and job-tailored rewrite are unlocked on this device for up to 30 days.";
  updatePaywallUi(true);
  updateRewriteUi(true);
  if (sharePanel) sharePanel.hidden = false;
  if (emailPanel) emailPanel.hidden = false;
}

function updateRewriteUi(isPremium) {
  if (!rewriteLocked || !rewriteTools || !rewritePremiumTag) return;

  if (isPremium) {
    rewriteLocked.hidden = true;
    rewriteTools.hidden = false;
    rewritePremiumTag.textContent = "Unlocked";
    rewritePremiumTag.className = "rewrite-tag unlocked";
  } else {
    rewriteLocked.hidden = false;
    rewriteTools.hidden = true;
    rewritePremiumTag.textContent = "Locked";
    rewritePremiumTag.className = "rewrite-tag locked";
    latestRewrite = "";
    if (copyRewriteBtn) copyRewriteBtn.style.display = "none";
    if (downloadRewriteBtn) downloadRewriteBtn.style.display = "none";
  }
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

function renderKeywordChips(container, items, className) {
  container.innerHTML = "";
  if (!Array.isArray(items) || items.length === 0) {
    container.innerHTML = `<span class="keyword-empty">None detected yet.</span>`;
    return;
  }

  items.forEach((item) => {
    const chip = document.createElement("span");
    chip.className = `keyword-chip ${className || ""}`.trim();
    chip.textContent = item;
    container.appendChild(chip);
  });
}

function renderJobMatchPanel(data) {
  const hasJobData =
    typeof data.jobMatchScore === "number" ||
    (Array.isArray(data.jobMatchedKeywords) && data.jobMatchedKeywords.length > 0) ||
    (Array.isArray(data.jobMissingKeywords) && data.jobMissingKeywords.length > 0);

  if (!hasJobData || (data.tier === "free" && data.locked)) {
    jobMatchPanel.hidden = true;
    return;
  }

  jobMatchPanel.hidden = false;
  jobFitSummary.textContent = data.jobFitSummary
    ? data.jobFitSummary
    : typeof data.jobMatchScore === "number"
      ? `Job match score: ${data.jobMatchScore}/100`
      : "";

  renderKeywordChips(matchedKeywords, data.jobMatchedKeywords, "matched");
  renderKeywordChips(missingJobKeywords, data.jobMissingKeywords, "missing");
}

function buildReportText(data) {
  return renderAnalysis(data, true);
}

function showPaymentStatus(message, isError = false) {
  if (!paymentStatus) return;
  paymentStatus.hidden = !message;
  paymentStatus.textContent = message;
  paymentStatus.className = isError ? "payment-status error" : "payment-status";
}

function updatePaywallUi(isPremium) {
  paywallBox.hidden = isPremium;

  if (unlockBtn) {
    unlockBtn.textContent = isPremium
      ? "Premium unlocked"
      : `Unlock full report — ${pricing.priceLabel}`;
    unlockBtn.disabled = isPremium;
  }

  if (!isPremium && !pricing.stripeConfigured) {
    showPaymentStatus(
      "Checkout is not live yet. Add STRIPE_SECRET_KEY and STRIPE_PRICE_ID on Render, then redeploy the backend.",
      true
    );
  } else {
    showPaymentStatus("");
  }
}

function showScoreHero(score) {
  if (!scoreHero || !scoreHeroRing || !scoreHeroValue) return;

  if (typeof score !== "number") {
    scoreHero.hidden = true;
    return;
  }

  scoreHero.hidden = false;
  scoreHeroValue.textContent = String(score);
  scoreHeroRing.style.setProperty("--score", String(score));
  scoreHero.classList.remove("score-hero-animate");
  void scoreHero.offsetWidth;
  scoreHero.classList.add("score-hero-animate");
}

function updateResultsUi(data) {
  latestAnalysis = data;
  showScoreHero(data.score);
  analysisOutput.textContent = renderAnalysis(data);
  analyzeBtn.style.display = "inline-block";
  renderJobMatchPanel(data);

  const isPremium = data.tier === "premium" || data.locked === false;
  if (isPremium) applyPremiumUi(getUnlockToken().startsWith("referral_") ? "referral" : "stripe");
  else updateRewriteUi(false);
  updatePaywallUi(isPremium);
  if (sharePanel) sharePanel.hidden = !isPremium;
  if (emailPanel) emailPanel.hidden = !isPremium;
}

function isValidResumeText(text) {
  if (!text || typeof text !== "string") return false;
  const trimmed = text.trim();
  if (trimmed.length < 80) return false;
  if (trimmed.startsWith("Please choose") || trimmed.startsWith("Upload failed")) return false;
  if (trimmed === OUTPUT_PLACEHOLDER || trimmed === ANALYSIS_PLACEHOLDER) return false;
  if (/^upload a resume to see extracted text here\.?$/i.test(trimmed)) return false;
  return true;
}

function saveResumeDraft() {
  const text = output?.textContent?.trim() || "";
  const job = jobDescriptionInput?.value?.trim() || "";
  if (isValidResumeText(text)) {
    localStorage.setItem(RESUME_STORAGE_KEY, text);
    sessionStorage.setItem(RESUME_STORAGE_KEY, text);
  }
  localStorage.setItem(JOB_STORAGE_KEY, job);
  sessionStorage.setItem(JOB_STORAGE_KEY, job);
}

function restoreResumeDraft() {
  const savedResume =
    localStorage.getItem(RESUME_STORAGE_KEY) ||
    sessionStorage.getItem(RESUME_STORAGE_KEY) ||
    "";
  const savedJob =
    localStorage.getItem(JOB_STORAGE_KEY) ||
    sessionStorage.getItem(JOB_STORAGE_KEY) ||
    "";

  if (savedResume && output && isValidResumeText(savedResume)) {
    output.textContent = savedResume;
  }

  if (savedJob && jobDescriptionInput) {
    jobDescriptionInput.value = savedJob;
  }

  return savedResume;
}

function showPremiumWelcome() {
  showAnalysisMessage(
    "Payment successful — premium is unlocked. Upload or restore your resume below, then we will run your full report."
  );
}

function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function printReport() {
  if (!latestAnalysis) return;
  const popup = window.open("", "_blank", "noopener,noreferrer,width=800,height=900");
  if (!popup) return;
  popup.document.write(`<pre style="font-family:Segoe UI,Arial,sans-serif;white-space:pre-wrap;padding:24px;">${buildReportText(latestAnalysis).replace(/</g, "&lt;")}</pre>`);
  popup.document.close();
  popup.focus();
  popup.print();
}

async function loadEmailStatus() {
  try {
    const res = await fetch(`${API_BASE}/api/resume/email-status`);
    if (!res.ok) return;
    const data = await res.json();
    emailDeliveryEnabled = Boolean(data.configured);
    if (emailHelpText) {
      emailHelpText.textContent = emailDeliveryEnabled
        ? "We will email your full premium report to the address below."
        : "Email delivery is not enabled yet. You can still download or print your report below.";
    }
  } catch (_) {
    /* ignore */
  }
}

async function loadContactInfo() {
  try {
    const res = await fetch(`${API_BASE}/api/resume/contact`);
    if (!res.ok) return;
    const data = await res.json();
    if (contactEmailLink && data.email) {
      contactEmailLink.href = `mailto:${data.email}?subject=MoTechCo%20Resume%20Analyzer%20help`;
      contactEmailLink.textContent = data.email;
    }
    if (contactHelpText && data.message) {
      contactHelpText.textContent = data.message;
    }
  } catch (_) {
    /* ignore */
  }
}

async function restorePremiumAccess() {
  const token = getUnlockToken();
  if (!token) return;

  if (token.startsWith("referral_")) {
    applyPremiumUi("referral");
    return;
  }

  if (!token.startsWith("cs_")) return;

  try {
    const res = await fetch(`${API_BASE}/api/resume/premium-status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unlockToken: token }),
    });
    const data = await res.json();
    if (res.ok && data.premium) {
      if (data.unlockToken) setUnlockToken(data.unlockToken);
      applyPremiumUi("stripe");
    } else {
      setUnlockToken("");
    }
  } catch (_) {
    /* ignore */
  }
}

async function generateRewrite() {
  const resumeText = output?.textContent?.trim() || "";
  const jobText = jobDescriptionInput?.value?.trim() || "";

  if (!getUnlockToken()) {
    rewriteStatus.textContent = "Unlock premium to generate a tailored resume.";
    return;
  }

  if (!isValidResumeText(resumeText)) {
    rewriteStatus.textContent = "Upload your resume first.";
    return;
  }

  if (jobText.length < 40) {
    rewriteStatus.textContent = "Paste the target job description above first.";
    return;
  }

  rewriteBtn.disabled = true;
  rewriteStatus.textContent = "Generating a job-tailored resume...";
  rewriteOutput.textContent = "Working...";

  try {
    const res = await fetch(`${API_BASE}/api/resume/rewrite-resume`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: resumeText,
        jobDescription: jobText,
        unlockToken: getUnlockToken(),
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      rewriteStatus.textContent = data.detail || data.error || "Could not generate rewrite.";
      rewriteOutput.textContent = "Your tailored resume will appear here.";
      return;
    }

    latestRewrite = data.rewrittenResume || "";
    rewriteOutput.textContent = latestRewrite;
    rewriteStatus.textContent = data.disclaimer || "Review before applying.";
    if (copyRewriteBtn) copyRewriteBtn.style.display = "inline-block";
    if (downloadRewriteBtn) downloadRewriteBtn.style.display = "inline-block";
  } catch (_) {
    rewriteStatus.textContent = "Could not generate rewrite right now. Try again in a moment.";
    rewriteOutput.textContent = "Your tailored resume will appear here.";
  } finally {
    rewriteBtn.disabled = false;
  }
}

async function loadPricing() {
  try {
    const res = await fetch(`${API_BASE}/api/resume/pricing`);
    if (res.ok) pricing = await res.json();
  } catch (_) {
    /* keep defaults */
  }

  updatePaywallUi(Boolean(getUnlockToken()));
  updateRewriteUi(Boolean(getUnlockToken()));
}

async function redeemReferralFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref");
  if (!ref) return;

  try {
    const res = await fetch(`${API_BASE}/api/resume/referral/redeem`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refCode: ref, deviceId: getDeviceId() }),
    });
    const data = await res.json();

    if (res.ok && data.unlockToken) {
      setUnlockToken(data.unlockToken);
      applyPremiumUi("referral");
      const savedResume = restoreResumeDraft();
      if (isValidResumeText(savedResume)) {
        await runAnalysis(savedResume);
      }
    }
  } catch (_) {
    /* ignore */
  } finally {
    params.delete("ref");
    const next = `${window.location.pathname}${params.toString() ? `?${params}` : ""}`;
    window.history.replaceState({}, "", next);
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
      applyPremiumUi("stripe");
      const savedResume = restoreResumeDraft();
      if (isValidResumeText(savedResume)) {
        await runAnalysis(savedResume);
      } else {
        showPremiumWelcome();
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
  if (!pricing.stripeConfigured) {
    showPaymentStatus(
      "Payments are not configured on the server yet. Add your Stripe test keys on Render, redeploy, then try again.",
      true
    );
    return;
  }

  if (!isValidResumeText(output.textContent.trim())) {
    showPaymentStatus("Upload and analyze your resume first, then unlock premium.", true);
    return;
  }

  saveResumeDraft();

  unlockBtn.disabled = true;
  unlockBtn.textContent = "Redirecting to secure checkout...";
  showPaymentStatus("Opening Stripe checkout...");

  try {
    const res = await fetch(`${API_BASE}/api/resume/create-checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const data = await res.json();

    if (!res.ok || !data.url) {
      showPaymentStatus(
        data.detail || data.error || "Checkout is not available yet. Add Stripe keys on Render.",
        true
      );
      return;
    }

    window.location.href = data.url;
  } catch (_) {
    showPaymentStatus("Could not start checkout. Try again in a moment.", true);
  } finally {
    unlockBtn.disabled = false;
    unlockBtn.textContent = `Unlock full report — ${pricing.priceLabel}`;
  }
}

async function runAnalysis(resumeText) {
  if (!isValidResumeText(resumeText)) {
    showAnalysisMessage("Upload a resume first, then we will analyze it automatically.");
    return false;
  }

  setLoading(true, "Reviewing your resume...", COLD_START_NOTE);
  showAnalysisMessage("Generating structured feedback...");
  if (scoreHero) scoreHero.hidden = true;
  paywallBox.hidden = true;
  sharePanel.hidden = true;
  emailPanel.hidden = true;
  jobMatchPanel.hidden = true;

  const payload = {
    text: resumeText,
    jobDescription: jobDescriptionInput.value.trim(),
    unlockToken: getUnlockToken(),
  };

  try {
    const res = await fetchWithTimeout(`${API_BASE}/api/resume/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      const friendly =
        data.detail ||
        data.error ||
        "Analysis failed. Try again in a moment.";
      showAnalysisMessage(friendly);
      return false;
    }

    updateResultsUi(data);
    return true;
  } catch (err) {
    const timedOut = err?.name === "AbortError";
    showAnalysisMessage(
      timedOut
        ? 'This is taking too long — likely Google AI quota or the server waking up. Wait 1 minute, then click "Run again".'
        : 'Analysis failed. Wait about 60 seconds, then click "Run again".'
    );
    return false;
  } finally {
    setLoading(false);
  }
}

async function sendEmailReport() {
  if (!latestAnalysis) return;

  const email = emailInput.value.trim();
  if (!email) {
    emailStatus.textContent = "Enter a valid email address.";
    return;
  }

  emailReportBtn.disabled = true;
  emailStatus.textContent = "Sending...";

  try {
    const res = await fetch(`${API_BASE}/api/resume/email-report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        score: latestAnalysis.score ?? null,
        reportText: buildReportText(latestAnalysis),
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      emailStatus.textContent = data.error || "Could not send report.";
      return;
    }

    emailStatus.textContent = data.message || "Report request received.";

    if (!data.emailed) {
      downloadTextFile("motechco-resume-report.txt", buildReportText(latestAnalysis));
    }
  } catch (_) {
    emailStatus.textContent = "Could not send report right now.";
  } finally {
    emailReportBtn.disabled = false;
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fileInput = document.getElementById("resume");
  if (!fileInput.files[0]) {
    output.textContent = "Please choose a file first.";
    return;
  }

  setLoading(true, "Extracting text from your file...", COLD_START_NOTE);
  output.textContent = "";
  showAnalysisMessage("Preparing your review...");
  if (scoreHero) scoreHero.hidden = true;
  analyzeBtn.style.display = "none";
  paywallBox.hidden = true;
  sharePanel.hidden = true;
  emailPanel.hidden = true;
  jobMatchPanel.hidden = true;

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
      showAnalysisMessage(ANALYSIS_PLACEHOLDER);
      return;
    }

    resumeText = data.text || data.content || "Upload completed, but no text was extracted.";
    output.textContent = resumeText;
    output.scrollLeft = 0;
    saveResumeDraft();
  } catch (_) {
    output.textContent = "Upload failed. The backend may be waking up — try again in a moment.";
    showAnalysisMessage(ANALYSIS_PLACEHOLDER);
    return;
  } finally {
    setLoading(false);
  }

  await runAnalysis(resumeText.trim());
});

analyzeBtn.addEventListener("click", async () => {
  await runAnalysis(output.textContent.trim());
});

if (rewriteBtn) rewriteBtn.addEventListener("click", generateRewrite);

if (rewriteUnlockBtn) rewriteUnlockBtn.addEventListener("click", startCheckout);

if (copyRewriteBtn) {
  copyRewriteBtn.addEventListener("click", async () => {
    if (!latestRewrite) return;
    try {
      await navigator.clipboard.writeText(latestRewrite);
      copyRewriteBtn.textContent = "Copied!";
      rewriteStatus.textContent = "Copied to clipboard. Paste into Word, Google Docs, or your application form.";
      setTimeout(() => {
        copyRewriteBtn.textContent = "Copy resume text";
      }, 1800);
    } catch (_) {
      rewriteOutput.focus();
      document.getSelection()?.selectAllChildren(rewriteOutput);
      rewriteStatus.textContent = "Select the text above and press Ctrl+C to copy.";
    }
  });
}

if (downloadRewriteBtn) {
  downloadRewriteBtn.addEventListener("click", () => {
    if (!latestRewrite) return;
    downloadTextFile("motechco-tailored-resume.txt", latestRewrite);
  });
}

if (unlockBtn) unlockBtn.addEventListener("click", startCheckout);

if (copyReferralBtn) {
  copyReferralBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(getReferralShareUrl());
      copyReferralBtn.textContent = "Copied!";
      if (referralStatus) {
        referralStatus.textContent = "Link copied. Send it to a friend — when they open it, they get 24 hours of premium free.";
      }
      setTimeout(() => {
        copyReferralBtn.textContent = "Copy link";
      }, 1800);
    } catch (_) {
      referralLink.select();
    }
  });
}

if (downloadCardBtn) {
  downloadCardBtn.addEventListener("click", () => {
    if (!latestAnalysis) return;
    window.MoTechCoShare.downloadScoreCard(latestAnalysis);
  });
}

if (downloadReportBtn) {
  downloadReportBtn.addEventListener("click", () => {
    if (!latestAnalysis) return;
    downloadTextFile("motechco-resume-report.txt", buildReportText(latestAnalysis));
  });
}

if (printReportBtn) printReportBtn.addEventListener("click", printReport);
if (emailReportBtn) emailReportBtn.addEventListener("click", sendEmailReport);

if (copyShareBtn) {
  copyShareBtn.addEventListener("click", async () => {
    if (!latestAnalysis) return;
    const text = `${window.MoTechCoShare.buildShareText(latestAnalysis)}\nReferral: ${getReferralShareUrl()}`;
    try {
      await navigator.clipboard.writeText(text);
      copyShareBtn.textContent = "Copied!";
      setTimeout(() => {
        copyShareBtn.textContent = "Copy caption";
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

setupReferralLinkField();
restoreResumeDraft();
loadPricing();
loadEmailStatus();
loadContactInfo();
restorePremiumAccess().then(() => {
  if (getUnlockToken()) updateRewriteUi(true);
});
redeemReferralFromUrl();
verifyPaymentFromUrl();
