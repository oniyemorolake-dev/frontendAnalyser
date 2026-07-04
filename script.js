const form = document.getElementById("uploadForm");
const loading = document.getElementById("loading");
const loadingNote = document.getElementById("loadingNote");
const output = document.getElementById("output");
const analyzeBtn = document.getElementById("analyzeBtn");
const submitBtn = document.getElementById("submitBtn");
const analysisOutput = document.getElementById("analysisOutput");
const API_BASE = "https://backendaianalysers.onrender.com";

const ANALYSIS_PLACEHOLDER =
  "Your AI feedback will appear here after you upload a resume. One click does it all — extract text, then analyze.";

const COLD_START_NOTE =
  "First request after idle may take up to 60 seconds on the free tier.";

analysisOutput.textContent = ANALYSIS_PLACEHOLDER;

function setLoading(active, message, note) {
  loading.style.display = active ? "block" : "none";
  loading.textContent = message || "Working...";
  loadingNote.style.display = active && note ? "block" : "none";
  if (note) loadingNote.textContent = note;
  submitBtn.disabled = active;
  analyzeBtn.disabled = active;
}

function renderAnalysis(data) {
  if (data.raw) {
    return `Could not parse structured feedback.\n\nRaw model output:\n${data.raw}`;
  }

  const lines = [];

  if (typeof data.score === "number") {
    lines.push(`Overall Score: ${data.score}/100`, "");
  }

  const sections = [
    ["Strengths", data.strengths],
    ["Weaknesses", data.weaknesses],
    ["Missing Keywords", data.missingKeywords],
    ["Formatting Suggestions", data.formattingSuggestions],
  ];

  for (const [title, items] of sections) {
    if (Array.isArray(items) && items.length > 0) {
      lines.push(`${title}:`);
      items.forEach((item) => lines.push(`  • ${item}`));
      lines.push("");
    }
  }

  if (lines.length === 0) {
    return JSON.stringify(data, null, 2);
  }

  return lines.join("\n").trim();
}

function isValidResumeText(text) {
  return (
    text &&
    !text.startsWith("Please choose") &&
    !text.startsWith("Upload failed")
  );
}

async function runAnalysis(resumeText) {
  if (!isValidResumeText(resumeText)) {
    analysisOutput.textContent = "Upload a resume first, then we'll analyze it automatically.";
    return false;
  }

  setLoading(true, "Step 2 of 2 — Analyzing your resume with AI...", COLD_START_NOTE);
  analysisOutput.textContent = "Generating AI feedback...";

  try {
    const res = await fetch(`${API_BASE}/api/resume/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: resumeText }),
    });

    const data = await res.json();

    if (!res.ok) {
      const detail = data.detail ? `\n\nDetails: ${data.detail}` : "";
      analysisOutput.textContent = `${data.error || "Analysis failed."}${detail}\n\nClick "Re-analyze" to try again.`;
      return false;
    }

    analysisOutput.textContent = renderAnalysis(data);
    analyzeBtn.style.display = "inline-block";
    return true;
  } catch (err) {
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

    resumeText =
      data.text || data.content || "Upload completed, but no text was extracted.";
    output.textContent = resumeText;
    output.scrollLeft = 0;
  } catch (err) {
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
