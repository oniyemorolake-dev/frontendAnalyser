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
const jobCharCount = document.getElementById("jobCharCount");
const quotaHelp = document.getElementById("quotaHelp");
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
const coverLetterPanel = document.getElementById("coverLetterPanel");
const coverLetterBtn = document.getElementById("coverLetterBtn");
const coverLetterOutput = document.getElementById("coverLetterOutput");
const coverLetterStatus = document.getElementById("coverLetterStatus");
const coverLetterLocked = document.getElementById("coverLetterLocked");
const coverLetterTools = document.getElementById("coverLetterTools");
const coverLetterPremiumTag = document.getElementById("coverLetterPremiumTag");
const coverLetterUnlockBtn = document.getElementById("coverLetterUnlockBtn");
const copyCoverLetterBtn = document.getElementById("copyCoverLetterBtn");
const downloadCoverLetterBtn = document.getElementById("downloadCoverLetterBtn");
const linkedInPanel = document.getElementById("linkedInPanel");
const linkedInInput = document.getElementById("linkedInInput");
const linkedInBtn = document.getElementById("linkedInBtn");
const linkedInOutput = document.getElementById("linkedInOutput");
const linkedInStatus = document.getElementById("linkedInStatus");
const linkedInLocked = document.getElementById("linkedInLocked");
const linkedInTools = document.getElementById("linkedInTools");
const linkedInPremiumTag = document.getElementById("linkedInPremiumTag");
const linkedInUnlockBtn = document.getElementById("linkedInUnlockBtn");
const copyLinkedInBtn = document.getElementById("copyLinkedInBtn");
const downloadLinkedInBtn = document.getElementById("downloadLinkedInBtn");
const interviewPanel = document.getElementById("interviewPanel");
const interviewBtn = document.getElementById("interviewBtn");
const interviewOutput = document.getElementById("interviewOutput");
const interviewStatus = document.getElementById("interviewStatus");
const interviewLocked = document.getElementById("interviewLocked");
const interviewTools = document.getElementById("interviewTools");
const interviewPremiumTag = document.getElementById("interviewPremiumTag");
const interviewUnlockBtn = document.getElementById("interviewUnlockBtn");
const copyInterviewBtn = document.getElementById("copyInterviewBtn");
const downloadInterviewBtn = document.getElementById("downloadInterviewBtn");
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
const freeLeadPanel = document.getElementById("freeLeadPanel");
const freeLeadEmail = document.getElementById("freeLeadEmail");
const freeLeadBtn = document.getElementById("freeLeadBtn");
const freeLeadStatus = document.getElementById("freeLeadStatus");
const paywallPrice = document.getElementById("paywallPrice");
const unlockBtnPrice = document.getElementById("unlockBtnPrice");
const stickyUnlockBar = document.getElementById("stickyUnlockBar");
const stickyUnlockBtn = document.getElementById("stickyUnlockBtn");
const stickyUnlockText = document.getElementById("stickyUnlockText");
const stickyUnlockPrice = document.getElementById("stickyUnlockPrice");

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
let latestCoverLetter = "";
let latestLinkedInAbout = "";
let latestInterviewPrep = "";
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
    if (typeof data.issuesFound === "number" && data.issuesFound > 0) {
      lines.push(
        `Hidden in free preview: ${data.issuesFound} improvement area${data.issuesFound === 1 ? "" : "s"} (weaknesses, keywords, or formatting).`,
        ""
      );
    }
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

function updateJobCharCount() {
  if (!jobCharCount || !jobDescriptionInput) return;
  jobCharCount.textContent = String(jobDescriptionInput.value.trim().length);
}

function showQuotaHelp(visible) {
  if (quotaHelp) quotaHelp.hidden = !visible;
}

function isQuotaMessage(message) {
  return /quota|free tier|temporarily busy|rate limit/i.test(String(message || ""));
}

function showAnalysisMessage(message) {
  analysisOutput.textContent = message;
  showQuotaHelp(isQuotaMessage(message));
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
    "Full application kit unlocked on this device for up to 30 days.";
  updatePaywallUi(true);
  updateRewriteUi(true);
  updateCoverLetterUi(true);
  updateLinkedInUi(true);
  updateInterviewUi(true);
  if (sharePanel) sharePanel.hidden = false;
  if (emailPanel) emailPanel.hidden = false;
}

function updateLinkedInUi(isPremium) {
  if (!linkedInLocked || !linkedInTools || !linkedInPremiumTag) return;

  if (isPremium) {
    linkedInLocked.hidden = true;
    linkedInTools.hidden = false;
    linkedInPremiumTag.textContent = "Unlocked";
    linkedInPremiumTag.className = "rewrite-tag unlocked";
  } else {
    linkedInLocked.hidden = false;
    linkedInTools.hidden = true;
    linkedInPremiumTag.textContent = "Locked";
    linkedInPremiumTag.className = "rewrite-tag locked";
    latestLinkedInAbout = "";
    if (copyLinkedInBtn) copyLinkedInBtn.style.display = "none";
    if (downloadLinkedInBtn) downloadLinkedInBtn.style.display = "none";
  }
}

function updateInterviewUi(isPremium) {
  if (!interviewLocked || !interviewTools || !interviewPremiumTag) return;

  if (isPremium) {
    interviewLocked.hidden = true;
    interviewTools.hidden = false;
    interviewPremiumTag.textContent = "Unlocked";
    interviewPremiumTag.className = "rewrite-tag unlocked";
  } else {
    interviewLocked.hidden = false;
    interviewTools.hidden = true;
    interviewPremiumTag.textContent = "Locked";
    interviewPremiumTag.className = "rewrite-tag locked";
    latestInterviewPrep = "";
    if (copyInterviewBtn) copyInterviewBtn.style.display = "none";
    if (downloadInterviewBtn) downloadInterviewBtn.style.display = "none";
  }
}

function updateCoverLetterUi(isPremium) {
  if (!coverLetterLocked || !coverLetterTools || !coverLetterPremiumTag) return;

  if (isPremium) {
    coverLetterLocked.hidden = true;
    coverLetterTools.hidden = false;
    coverLetterPremiumTag.textContent = "Unlocked";
    coverLetterPremiumTag.className = "rewrite-tag unlocked";
  } else {
    coverLetterLocked.hidden = false;
    coverLetterTools.hidden = true;
    coverLetterPremiumTag.textContent = "Locked";
    coverLetterPremiumTag.className = "rewrite-tag locked";
    latestCoverLetter = "";
    if (copyCoverLetterBtn) copyCoverLetterBtn.style.display = "none";
    if (downloadCoverLetterBtn) downloadCoverLetterBtn.style.display = "none";
  }
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

function syncPriceLabels() {
  const label = pricing.priceLabel || "$4.99";
  if (paywallPrice) paywallPrice.textContent = label;
  if (unlockBtnPrice) unlockBtnPrice.textContent = label;
  if (stickyUnlockPrice) stickyUnlockPrice.textContent = label;
}

function updateStickyUnlockBar(isPremium, data) {
  if (!stickyUnlockBar) return;

  if (isPremium || !data || data.tier !== "free" || !data.locked) {
    stickyUnlockBar.hidden = true;
    return;
  }

  stickyUnlockBar.hidden = false;
  if (stickyUnlockText) {
    const scorePart =
      typeof data.score === "number" ? `Score ${data.score}/100 — ` : "";
    const issuesPart =
      typeof data.issuesFound === "number" && data.issuesFound > 0
        ? `${data.issuesFound} fixes hidden. `
        : "";
    stickyUnlockText.textContent = `${scorePart}${issuesPart}Unlock the full application kit`;
  }
}

function updateFreeLeadPanel(isPremium, data) {
  if (!freeLeadPanel) return;
  const show = !isPremium && data && data.tier === "free" && data.locked;
  freeLeadPanel.hidden = !show;
  if (!show && freeLeadStatus) freeLeadStatus.textContent = "";
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
    unlockBtn.disabled = isPremium;
    if (isPremium) {
      unlockBtn.textContent = "Premium unlocked";
    } else {
      syncPriceLabels();
    }
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
  else {
    updateRewriteUi(false);
    updateCoverLetterUi(false);
    updateLinkedInUi(false);
    updateInterviewUi(false);
  }
  updatePaywallUi(isPremium);
  updateStickyUnlockBar(isPremium, data);
  updateFreeLeadPanel(isPremium, data);
  if (sharePanel) sharePanel.hidden = !isPremium;
  if (emailPanel) emailPanel.hidden = !isPremium;
  if (!isPremium && data.tier === "free" && data.locked) {
    paywallBox.hidden = false;
  }
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

  try {
    const res = await fetch(`${API_BASE}/api/resume/premium-status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unlockToken: token }),
    });
    const data = await res.json();
    if (res.ok && data.premium) {
      if (data.unlockToken) setUnlockToken(data.unlockToken);
      applyPremiumUi(data.source === "referral" ? "referral" : "stripe");
    } else {
      setUnlockToken("");
      updatePaywallUi(false);
      updateRewriteUi(false);
      updateCoverLetterUi(false);
      updateLinkedInUi(false);
      updateInterviewUi(false);
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
    rewriteStatus.textContent = `Paste the full job posting above (not just the title). You have ${jobText.length} characters — need at least 40.`;
    rewriteStatus.className = "fine-print payment-status error";
    return;
  }

  rewriteBtn.disabled = true;
  rewriteStatus.className = "fine-print";
  rewriteStatus.textContent = "Generating a job-tailored resume... this can take up to 90 seconds.";
  rewriteOutput.textContent = "Working...";

  try {
    const res = await fetchWithTimeout(
      `${API_BASE}/api/resume/rewrite-resume`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: resumeText,
          jobDescription: jobText,
          unlockToken: getUnlockToken(),
        }),
      },
      120000
    );
    const data = await res.json();

    if (!res.ok) {
      rewriteStatus.className = "fine-print payment-status error";
      if (res.status === 402) {
        rewriteStatus.textContent =
          "Premium could not be verified on the server. Refresh the page, or pay once more if needed.";
        setUnlockToken("");
        updateRewriteUi(false);
      } else {
        rewriteStatus.textContent = data.detail || data.error || "Could not generate rewrite.";
      }
      rewriteOutput.textContent = "Your tailored resume will appear here after you generate it.";
      return;
    }

    latestRewrite = data.rewrittenResume || "";
    rewriteOutput.textContent = latestRewrite;
    rewriteStatus.className = "fine-print";
    rewriteStatus.textContent = data.disclaimer || "Review before applying.";
    if (copyRewriteBtn) copyRewriteBtn.style.display = "inline-block";
    if (downloadRewriteBtn) downloadRewriteBtn.style.display = "inline-block";
  } catch (err) {
    rewriteStatus.className = "fine-print payment-status error";
    rewriteStatus.textContent =
      err?.name === "AbortError"
        ? "Rewrite timed out — likely AI quota or server wake-up. Wait 1 minute, then try again."
        : "Could not generate rewrite right now. Wait 1 minute, then try again.";
    rewriteOutput.textContent = "Your tailored resume will appear here after you generate it.";
  } finally {
    rewriteBtn.disabled = false;
  }
}

async function generateCoverLetter() {
  const resumeText = output?.textContent?.trim() || "";
  const jobText = jobDescriptionInput?.value?.trim() || "";

  if (!getUnlockToken()) {
    coverLetterStatus.textContent = "Unlock premium to generate a cover letter.";
    return;
  }

  if (!isValidResumeText(resumeText)) {
    coverLetterStatus.textContent = "Upload your resume first.";
    return;
  }

  if (jobText.length < 40) {
    coverLetterStatus.textContent = `Paste the full job posting above. You have ${jobText.length} characters — need at least 40.`;
    coverLetterStatus.className = "fine-print payment-status error";
    return;
  }

  coverLetterBtn.disabled = true;
  coverLetterStatus.className = "fine-print";
  coverLetterStatus.textContent = "Writing your cover letter... this can take up to 90 seconds.";
  coverLetterOutput.textContent = "Working...";

  try {
    const res = await fetchWithTimeout(
      `${API_BASE}/api/resume/cover-letter`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: resumeText,
          jobDescription: jobText,
          unlockToken: getUnlockToken(),
        }),
      },
      120000
    );
    const data = await res.json();

    if (!res.ok) {
      coverLetterStatus.className = "fine-print payment-status error";
      if (res.status === 402) {
        coverLetterStatus.textContent =
          "Premium could not be verified on the server. Refresh the page, or pay once more if needed.";
        setUnlockToken("");
        updateCoverLetterUi(false);
      } else {
        coverLetterStatus.textContent = data.detail || data.error || "Could not generate cover letter.";
      }
      coverLetterOutput.textContent = "Your cover letter will appear here after you generate it.";
      return;
    }

    latestCoverLetter = data.coverLetter || "";
    coverLetterOutput.textContent = latestCoverLetter;
    coverLetterStatus.className = "fine-print";
    coverLetterStatus.textContent = data.disclaimer || "Review before sending.";
    if (copyCoverLetterBtn) copyCoverLetterBtn.style.display = "inline-block";
    if (downloadCoverLetterBtn) downloadCoverLetterBtn.style.display = "inline-block";
  } catch (err) {
    coverLetterStatus.className = "fine-print payment-status error";
    coverLetterStatus.textContent =
      err?.name === "AbortError"
        ? "Timed out — wait 1 minute, then try again."
        : "Could not generate cover letter right now. Wait 1 minute, then try again.";
    coverLetterOutput.textContent = "Your cover letter will appear here after you generate it.";
  } finally {
    coverLetterBtn.disabled = false;
  }
}

function formatInterviewPrep(data) {
  const lines = ["MoTechCo Interview Prep", ""];

  if (Array.isArray(data.prepTips) && data.prepTips.length > 0) {
    lines.push("Tips before the interview:");
    data.prepTips.forEach((tip) => lines.push(`  • ${tip}`));
    lines.push("");
  }

  if (Array.isArray(data.questions)) {
    data.questions.forEach((item, index) => {
      lines.push(`${index + 1}. ${item.question || "Question"}`);
      if (Array.isArray(item.answerHints)) {
        item.answerHints.forEach((hint) => lines.push(`   • ${hint}`));
      }
      lines.push("");
    });
  }

  lines.push("https://resume.motechco.ca");
  return lines.join("\n").trim();
}

async function generateLinkedInAbout() {
  const resumeText = output?.textContent?.trim() || "";
  const jobText = jobDescriptionInput?.value?.trim() || "";
  const currentAbout = linkedInInput?.value?.trim() || "";

  if (!getUnlockToken()) {
    linkedInStatus.textContent = "Unlock premium to optimize LinkedIn.";
    return;
  }

  if (!isValidResumeText(resumeText)) {
    linkedInStatus.textContent = "Upload your resume first.";
    return;
  }

  if (jobText.length < 40) {
    linkedInStatus.className = "fine-print payment-status error";
    linkedInStatus.textContent = `Paste the full job posting above. Need at least 40 characters.`;
    return;
  }

  linkedInBtn.disabled = true;
  linkedInStatus.className = "fine-print";
  linkedInStatus.textContent = "Optimizing your LinkedIn About... up to 90 seconds.";
  linkedInOutput.textContent = "Working...";

  try {
    const res = await fetchWithTimeout(
      `${API_BASE}/api/resume/optimize-linkedin`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: resumeText,
          jobDescription: jobText,
          linkedinAbout: currentAbout,
          unlockToken: getUnlockToken(),
        }),
      },
      120000
    );
    const data = await res.json();

    if (!res.ok) {
      linkedInStatus.className = "fine-print payment-status error";
      if (res.status === 402) {
        linkedInStatus.textContent = "Premium could not be verified. Refresh the page.";
        setUnlockToken("");
        updateLinkedInUi(false);
      } else {
        linkedInStatus.textContent = data.detail || data.error || "Could not optimize LinkedIn About.";
      }
      linkedInOutput.textContent = "Your LinkedIn About will appear here.";
      return;
    }

    latestLinkedInAbout = data.linkedInAbout || "";
    linkedInOutput.textContent = latestLinkedInAbout;
    linkedInStatus.className = "fine-print";
    linkedInStatus.textContent = data.disclaimer || "Review before posting on LinkedIn.";
    if (copyLinkedInBtn) copyLinkedInBtn.style.display = "inline-block";
    if (downloadLinkedInBtn) downloadLinkedInBtn.style.display = "inline-block";
  } catch (err) {
    linkedInStatus.className = "fine-print payment-status error";
    linkedInStatus.textContent =
      err?.name === "AbortError"
        ? "Timed out — wait 1 minute, then try again."
        : "Could not optimize LinkedIn right now.";
    linkedInOutput.textContent = "Your LinkedIn About will appear here.";
  } finally {
    linkedInBtn.disabled = false;
  }
}

async function generateInterviewPrep() {
  const resumeText = output?.textContent?.trim() || "";
  const jobText = jobDescriptionInput?.value?.trim() || "";

  if (!getUnlockToken()) {
    interviewStatus.textContent = "Unlock premium for interview prep.";
    return;
  }

  if (!isValidResumeText(resumeText)) {
    interviewStatus.textContent = "Upload your resume first.";
    return;
  }

  if (jobText.length < 40) {
    interviewStatus.className = "fine-print payment-status error";
    interviewStatus.textContent = `Paste the full job posting above. Need at least 40 characters.`;
    return;
  }

  interviewBtn.disabled = true;
  interviewStatus.className = "fine-print";
  interviewStatus.textContent = "Generating interview questions... up to 90 seconds.";
  interviewOutput.textContent = "Working...";

  try {
    const res = await fetchWithTimeout(
      `${API_BASE}/api/resume/interview-prep`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: resumeText,
          jobDescription: jobText,
          unlockToken: getUnlockToken(),
        }),
      },
      120000
    );
    const data = await res.json();

    if (!res.ok) {
      interviewStatus.className = "fine-print payment-status error";
      if (res.status === 402) {
        interviewStatus.textContent = "Premium could not be verified. Refresh the page.";
        setUnlockToken("");
        updateInterviewUi(false);
      } else {
        interviewStatus.textContent = data.detail || data.error || "Could not generate interview prep.";
      }
      interviewOutput.textContent = "Interview questions and hints will appear here.";
      return;
    }

    latestInterviewPrep = formatInterviewPrep(data);
    interviewOutput.textContent = latestInterviewPrep;
    interviewStatus.className = "fine-print";
    interviewStatus.textContent = data.disclaimer || "Practice out loud with your real examples.";
    if (copyInterviewBtn) copyInterviewBtn.style.display = "inline-block";
    if (downloadInterviewBtn) downloadInterviewBtn.style.display = "inline-block";
  } catch (err) {
    interviewStatus.className = "fine-print payment-status error";
    interviewStatus.textContent =
      err?.name === "AbortError"
        ? "Timed out — wait 1 minute, then try again."
        : "Could not generate interview prep right now.";
    interviewOutput.textContent = "Interview questions and hints will appear here.";
  } finally {
    interviewBtn.disabled = false;
  }
}

async function saveFreeScoreEmail() {
  if (!latestAnalysis || latestAnalysis.tier !== "free") return;

  const email = freeLeadEmail?.value?.trim() || "";
  if (!email) {
    if (freeLeadStatus) freeLeadStatus.textContent = "Enter your email address.";
    return;
  }

  if (freeLeadBtn) freeLeadBtn.disabled = true;
  if (freeLeadStatus) freeLeadStatus.textContent = "Sending...";

  try {
    const res = await fetch(`${API_BASE}/api/resume/save-score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        score: latestAnalysis.score ?? null,
        strengths: latestAnalysis.strengthsPreview || latestAnalysis.strengths || [],
        issuesFound: latestAnalysis.issuesFound ?? null,
        referralCode: getMyReferralCode(),
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      if (freeLeadStatus) freeLeadStatus.textContent = data.error || "Could not send score.";
      return;
    }

    if (freeLeadStatus) freeLeadStatus.textContent = data.message || "Check your inbox.";
    if (typeof gtag === "function") {
      gtag("event", "free_score_email", { score: latestAnalysis.score ?? 0 });
    }
  } catch (_) {
    if (freeLeadStatus) freeLeadStatus.textContent = "Could not send right now. Try again in a moment.";
  } finally {
    if (freeLeadBtn) freeLeadBtn.disabled = false;
  }
}

function handleCheckoutCanceled() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("canceled") !== "1") return;

  showPaymentStatus(
    "Checkout canceled — your free score is still saved. Unlock anytime when you are ready.",
    false
  );
  paywallBox.hidden = false;
  if (latestAnalysis) {
    updateStickyUnlockBar(false, latestAnalysis);
    updateFreeLeadPanel(false, latestAnalysis);
  }

  params.delete("canceled");
  const next = `${window.location.pathname}${params.toString() ? `?${params}` : ""}`;
  window.history.replaceState({}, "", next);
}

async function loadPricing() {
  try {
    const res = await fetch(`${API_BASE}/api/resume/pricing`);
    if (res.ok) pricing = await res.json();
  } catch (_) {
    /* keep defaults */
  }
  syncPriceLabels();
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
      body: JSON.stringify({ referralCode: getMyReferralCode() }),
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
    syncPriceLabels();
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
  if (freeLeadPanel) freeLeadPanel.hidden = true;
  if (stickyUnlockBar) stickyUnlockBar.hidden = true;

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
  if (freeLeadPanel) freeLeadPanel.hidden = true;
  if (stickyUnlockBar) stickyUnlockBar.hidden = true;

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

if (coverLetterBtn) coverLetterBtn.addEventListener("click", generateCoverLetter);

if (coverLetterUnlockBtn) coverLetterUnlockBtn.addEventListener("click", startCheckout);

if (linkedInBtn) linkedInBtn.addEventListener("click", generateLinkedInAbout);
if (linkedInUnlockBtn) linkedInUnlockBtn.addEventListener("click", startCheckout);

if (interviewBtn) interviewBtn.addEventListener("click", generateInterviewPrep);
if (interviewUnlockBtn) interviewUnlockBtn.addEventListener("click", startCheckout);

function wireCopyDownload(copyBtn, downloadBtn, getText, outputEl, statusEl, copyLabel, filename) {
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const text = getText();
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        copyBtn.textContent = "Copied!";
        if (statusEl) statusEl.textContent = "Copied to clipboard.";
        setTimeout(() => {
          copyBtn.textContent = copyLabel;
        }, 1800);
      } catch (_) {
        if (outputEl) {
          outputEl.focus();
          document.getSelection()?.selectAllChildren(outputEl);
        }
      }
    });
  }
  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      const text = getText();
      if (text) downloadTextFile(filename, text);
    });
  }
}

wireCopyDownload(
  copyLinkedInBtn,
  downloadLinkedInBtn,
  () => latestLinkedInAbout,
  linkedInOutput,
  linkedInStatus,
  "Copy About",
  "motechco-linkedin-about.txt"
);

wireCopyDownload(
  copyInterviewBtn,
  downloadInterviewBtn,
  () => latestInterviewPrep,
  interviewOutput,
  interviewStatus,
  "Copy prep",
  "motechco-interview-prep.txt"
);

if (copyCoverLetterBtn) {
  copyCoverLetterBtn.addEventListener("click", async () => {
    if (!latestCoverLetter) return;
    try {
      await navigator.clipboard.writeText(latestCoverLetter);
      copyCoverLetterBtn.textContent = "Copied!";
      coverLetterStatus.textContent = "Copied to clipboard. Paste into your application or email.";
      setTimeout(() => {
        copyCoverLetterBtn.textContent = "Copy letter";
      }, 1800);
    } catch (_) {
      coverLetterOutput.focus();
      document.getSelection()?.selectAllChildren(coverLetterOutput);
      coverLetterStatus.textContent = "Select the text above and press Ctrl+C to copy.";
    }
  });
}

if (downloadCoverLetterBtn) {
  downloadCoverLetterBtn.addEventListener("click", () => {
    if (!latestCoverLetter) return;
    downloadTextFile("motechco-cover-letter.txt", latestCoverLetter);
  });
}

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
if (stickyUnlockBtn) stickyUnlockBtn.addEventListener("click", startCheckout);
if (freeLeadBtn) freeLeadBtn.addEventListener("click", saveFreeScoreEmail);

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
    const text = window.MoTechCoShare.buildShareText(latestAnalysis, getMyReferralCode());
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
    const text = window.MoTechCoShare.buildShareText(latestAnalysis, getMyReferralCode());
    window.open(window.MoTechCoShare.getLinkedInShareUrl(text, getMyReferralCode()), "_blank", "noopener");
  });
}

if (twitterShareBtn) {
  twitterShareBtn.addEventListener("click", () => {
    if (!latestAnalysis) return;
    const ref = getMyReferralCode();
    const text = window.MoTechCoShare.buildShareText(latestAnalysis, ref);
    window.open(window.MoTechCoShare.getTwitterShareUrl(text, ref), "_blank", "noopener");
  });
}

setupReferralLinkField();
if (jobDescriptionInput) {
  jobDescriptionInput.addEventListener("input", updateJobCharCount);
  jobDescriptionInput.addEventListener("paste", () => {
    setTimeout(updateJobCharCount, 0);
  });
  updateJobCharCount();
}
restoreResumeDraft();
loadPricing();
loadEmailStatus();
loadContactInfo();
restorePremiumAccess().then(() => {
  if (getUnlockToken()) {
    updateRewriteUi(true);
    updateCoverLetterUi(true);
    updateLinkedInUi(true);
    updateInterviewUi(true);
  }
});
handleCheckoutCanceled();
redeemReferralFromUrl();
verifyPaymentFromUrl();
