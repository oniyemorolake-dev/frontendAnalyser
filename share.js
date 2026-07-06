(function (global) {
  const SITE_URL = "https://resume.motechco.ca";

  function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(" ");
    let line = "";
    let currentY = y;

    for (const word of words) {
      const testLine = line ? `${line} ${word}` : word;
      if (ctx.measureText(testLine).width > maxWidth && line) {
        ctx.fillText(line, x, currentY);
        line = word;
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }

    if (line) ctx.fillText(line, x, currentY);
  }

  function buildShareUrl(refCode) {
    if (refCode) {
      return `${SITE_URL}/index.html?ref=${encodeURIComponent(refCode)}`;
    }
    return SITE_URL;
  }

  function buildShareText(data, refCode) {
    const score = typeof data.score === "number" ? data.score : "?";
    const jobScore =
      typeof data.jobMatchScore === "number" ? `\nJob match: ${data.jobMatchScore}/100` : "";
    return `I scored ${score}/100 on my resume with MoTechCo AI.${jobScore}\n\nTry yours free: ${buildShareUrl(refCode)}`;
  }

  function renderScoreCard(data) {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext("2d");

    const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
    gradient.addColorStop(0, "#b57edc");
    gradient.addColorStop(1, "#7a2bb8");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 630);

    ctx.fillStyle = "rgba(255,255,255,0.14)";
    drawRoundedRect(ctx, 60, 60, 1080, 510, 28);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 54px Segoe UI, Arial, sans-serif";
    ctx.fillText("MoTechCo Resume Score", 100, 140);

    ctx.font = "28px Segoe UI, Arial, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.fillText("Soft. Smart. Lilac-powered AI for your career.", 100, 190);

    const score = typeof data.score === "number" ? data.score : "--";
    ctx.font = "bold 160px Segoe UI, Arial, sans-serif";
    ctx.fillText(String(score), 100, 360);

    ctx.font = "42px Segoe UI, Arial, sans-serif";
    ctx.fillText("/100 overall", 320, 360);

    if (typeof data.jobMatchScore === "number") {
      ctx.font = "34px Segoe UI, Arial, sans-serif";
      ctx.fillText(`Job match: ${data.jobMatchScore}/100`, 100, 430);
    }

    const topStrength =
      (Array.isArray(data.strengths) && data.strengths[0]) ||
      (Array.isArray(data.strengthsPreview) && data.strengthsPreview[0]) ||
      "AI-powered resume feedback";

    ctx.font = "28px Segoe UI, Arial, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.88)";
    wrapText(ctx, `Top strength: ${topStrength}`, 100, 500, 980, 34);

    ctx.font = "24px Segoe UI, Arial, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.82)";
    ctx.fillText(SITE_URL.replace("https://", ""), 100, 560);

    return canvas;
  }

  function downloadScoreCard(data, filename) {
    const canvas = renderScoreCard(data);
    const link = document.createElement("a");
    link.download = filename || "motechco-resume-score.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  function getLinkedInShareUrl(text, refCode) {
    return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(buildShareUrl(refCode))}&summary=${encodeURIComponent(text)}`;
  }

  function getTwitterShareUrl(text, refCode) {
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(buildShareUrl(refCode))}`;
  }

  global.MoTechCoShare = {
    SITE_URL,
    buildShareUrl,
    buildShareText,
    renderScoreCard,
    downloadScoreCard,
    getLinkedInShareUrl,
    getTwitterShareUrl,
  };
})(window);
