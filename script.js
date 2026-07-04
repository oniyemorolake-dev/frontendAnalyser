const form = document.getElementById("uploadForm");
const loading = document.getElementById("loading");
const output = document.getElementById("output");
const analyzeBtn = document.getElementById("analyzeBtn");
const analysisOutput = document.getElementById("analysisOutput");
const API_BASE = "https://backendaianalysers.onrender.com";

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fileInput = document.getElementById("resume");
  if (!fileInput.files[0]) {
    output.textContent = "Please choose a file first.";
    return;
  }

  loading.style.display = "block";
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
    output.textContent = data.text || data.content || data.message || "Upload completed.";
  } catch (err) {
    output.textContent = "Upload failed. Make sure backend is running.";
  } finally {
    loading.style.display = "none";
  }
});

analyzeBtn.addEventListener("click", async () => {
  const resumeText = output.textContent;

  if (!resumeText) {
    analysisOutput.textContent = "Upload a resume first 💜";
    return;
  }

  loading.style.display = "block";
  analysisOutput.textContent = "";

  try {
    const res = await fetch(`${API_BASE}/api/resume/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: resumeText }),
    });

    const data = await res.json();
    analysisOutput.textContent = data.analysis || JSON.stringify(data, null, 2) || "No analysis returned.";
  } catch (err) {
    analysisOutput.textContent = "Analysis failed. Check backend/API key.";
  } finally {
    loading.style.display = "none";
  }
});
