const form = document.getElementById("uploadForm");
const loading = document.getElementById("loading");
const loadingNote = document.getElementById("loadingNote");
const output = document.getElementById("output");
const analyzeBtn = document.getElementById("analyzeBtn");
const uploadBtn = form.querySelector('button[type="submit"]');
const analysisOutput = document.getElementById("analysisOutput");
const API_BASE = "https://backendaianalysers.onrender.com";

function setLoading(active, message, note) {
  loading.style.display = active ? "block" : "none";
  loading.textContent = message || "Working...";
  loadingNote.style.display = active && note ? "block" : "none";
  if (note) loadingNote.textContent = note;
  uploadBtn.disabled = active;
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

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fileInput = document.getElementById("resume");
  if (!fileInput.files[0]) {
    output.textContent = "Please choose a file first.";
    return;
  }

  setLoading(
    true,
    "Uploading and extracting text...",
    "First request after idle may take up to 60 seconds on the free tier."
  );
  output.textContent = "";
  analysisOutput.textContent = "";

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  try {
    const res = await fetch(`${API_BASE}/api/resume/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      output.textContent = data.error || `Upload failed (${res.status}).`;
      return;
    }

    output.textContent = data.text || data.content || "Upload completed, but no text was extracted.";
  } catch (err) {
    output.textContent = "Upload failed. The backend may be waking up — try again in a moment.";
  } finally {
    setLoading(false);
  }
});

analyzeBtn.addEventListener("click", async () => {
  const resumeText = output.textContent.trim();

  if (!resumeText || resumeText.startsWith("Please choose") || resumeText.startsWith("Upload failed")) {
    analysisOutput.textContent = "Upload a resume first.";
    return;
  }

  setLoading(
    true,
    "Analyzing your resume with AI...",
    "First request after idle may take up to 60 seconds on the free tier."
  );
  analysisOutput.textContent = "";

  try {
    const res = await fetch(`${API_BASE}/api/resume/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: resumeText }),
    });

    const data = await res.json();

    if (!res.ok) {
      const detail = data.detail ? `\n\nDetails: ${data.detail}` : "";
      analysisOutput.textContent = `${data.error || "Analysis failed."}${detail}`;
      return;
    }

    analysisOutput.textContent = renderAnalysis(data);
  } catch (err) {
    analysisOutput.textContent =
      "Analysis failed. The backend may be waking up — wait about 60 seconds and try again.";
  } finally {
    setLoading(false);
  }
});
