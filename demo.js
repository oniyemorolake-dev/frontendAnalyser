(function (global) {
  const SAMPLE_JOB =
    "AI Data Annotator — Toronto (hybrid)\n\nWe are hiring detail-oriented annotators to label training data for machine learning. Responsibilities include reviewing text and image tasks, maintaining quality standards, and collaborating remotely with project leads.\n\nRequired: attention to detail, English literacy, reliable internet, willingness to relocate to Toronto. Driver's license preferred. Experience with annotation pipelines is a plus.";

  const SAMPLE_RESUME =
    "MOROLAKE ONIYE\nAI Data Annotation Specialist | Quality Assurance\n\nExperience:\n• Data labeling and QA for ML training datasets\n• Attention to detail on structured annotation tasks\n• Remote collaboration with distributed teams\n\nSkills: Python basics, documentation, English fluency, quality control\n\nEducation: Diploma — Information Technology";

  const DEMO_ANALYSIS = {
    tier: "free",
    locked: true,
    isDemo: true,
    score: 72,
    strengthsPreview: [
      "Relevant data annotation and QA experience",
      "Clear remote-work and collaboration signals",
      "Skills section matches common ATS keywords",
    ],
    quickFixesPreview: [
      "Add measurable outcomes to bullet points (volume, accuracy %, tasks per day)",
      "Mention Toronto and relocation if accurate for this role",
      "Include driver's license in skills if you have one",
    ],
    issuesFound: 6,
    upgradeMessage: "Unlock your full application kit for $4.99.",
  };

  const BLUR_PREVIEW = {
    weaknesses: [
      "Bullet points lack measurable outcomes (no metrics or volume)",
      "Missing keywords from target posting: Toronto, relocation, driver's license",
      "Summary line could lead with role fit for the specific job",
    ],
    missingKeywords: ["Toronto", "relocation", "attention to detail", "annotation pipeline"],
    kitItems: [
      { icon: "📄", title: "Resume rewrite", desc: "Tailored to the job posting you paste" },
      { icon: "✉️", title: "Cover letter", desc: "From your real experience only" },
      { icon: "💼", title: "LinkedIn About", desc: "Aligned to the role" },
      { icon: "🎤", title: "Interview prep", desc: "Questions + answer hints" },
    ],
  };

  global.MoTechCoDemo = {
    SAMPLE_JOB,
    SAMPLE_RESUME,
    DEMO_ANALYSIS,
    BLUR_PREVIEW,
  };
})(window);
