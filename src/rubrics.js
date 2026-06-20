// Default rubric used by Sessions A, B, C, D, E
export const DEFAULT_RUBRIC = [
  { key: "research_excellence", label: "Research Excellence", points: 20 },
  { key: "innovation", label: "Innovation", points: 15 },
  { key: "industry_relevance", label: "Industry Relevance", points: 15 },
  { key: "technical_implementation", label: "Technical Implementation", points: 25 },
  { key: "presentation_communication", label: "Presentation & Communication", points: 10 },
  { key: "knowledge_qa", label: "Knowledge & Q&A", points: 15 },
];

// Session F: Systems Analysis & Design Showcase
export const SESSION_F_RUBRIC = [
  { key: "research_excellence", label: "Research Excellence", points: 20 },
  { key: "innovation", label: "Innovation", points: 15 },
  { key: "industry_relevance", label: "Industry Relevance", points: 15 },
  { key: "requirements_analysis", label: "Requirements Analysis and Problem Definition", points: 5 },
  { key: "process_models", label: "Process Models (Use Case, DFD, Activity Diagram, etc.)", points: 5 },
  { key: "data_design", label: "Data Design (ERD, Database Design)", points: 5 },
  { key: "system_design_architecture", label: "System Design and Architecture", points: 5 },
  { key: "prototype_wireframes", label: "Prototype, Wireframes, System Mock-up", points: 5 },
  { key: "presentation_communication", label: "Presentation & Communication", points: 10 },
  { key: "knowledge_qa", label: "Knowledge & Q&A", points: 15 },
];

// Session G: HCI & Java Programming Peer Mentoring Session
export const SESSION_G_RUBRIC = [
  { key: "research_excellence", label: "Research Excellence", points: 20 },
  { key: "innovation", label: "Innovation", points: 15 },
  { key: "industry_relevance", label: "Industry Relevance", points: 15 },
  { key: "functionality_completeness", label: "Functionality & Completeness of Features", points: 15 },
  { key: "ui_design_consistency", label: "UI Design & Visual Consistency", points: 5 },
  { key: "ux_navigation", label: "UX & Ease of Navigation", points: 5 },
  { key: "presentation_communication", label: "Presentation & Communication", points: 10 },
  { key: "knowledge_qa", label: "Knowledge & Q&A", points: 15 },
];

// Map a SessionType id to its rubric. Sessions 6 (F) and 7 (G) get
// specialized rubrics; everything else falls back to the default.
export const getRubricForSession = (sessionTypeId) => {
  switch (sessionTypeId) {
    case 6:
      return SESSION_F_RUBRIC;
    case 7:
      return SESSION_G_RUBRIC;
    default:
      return DEFAULT_RUBRIC;
  }
};

export const getMaxTotal = (rubric) =>
  rubric.reduce((sum, criterion) => sum + criterion.points, 0);

// Award categories, by discipline.
export const AWARD_CATEGORIES = {
  application_development: {
    label: "Application Development",
    awards: [
      "Best Mobile/Web Application",
      "Best Software Architecture",
      "Best Industry-Ready Solution",
      "Best AI-Powered Solution",
    ],
  },
  hci: {
    label: "HCI",
    awards: [
      "Best User Experience (UI/UX) 1",
      "Best User Experience (UI/UX) 2",
      "Best Algorithmic Solution",
    ],
  },
  data_science: {
    label: "Data Science",
    awards: [
      "Best Data Storytelling Award",
      "Best Machine Learning Model",
      "Best Data-Driven Innovation",
    ],
  },
  computer_architecture_iot: {
    label: "Computer Architecture / IoT",
    awards: [
      "Best IoT Innovation",
      "Best Embedded System Design",
      "Best Smart Monitoring Solution",
    ],
  },
  system_analysis_design: {
    label: "System Analysis & Design",
    awards: [
      "Best System Design",
      "Most Innovative Solution",
      "Best Business Process Design",
    ],
  },
};

// Map a SessionType id to the award category key(s) available for it.
// A session can offer more than one category (e.g. Session D offers both
// Application Development and Data Science awards).
export const getAwardCategoryKeysForSession = (sessionTypeId) => {
  switch (sessionTypeId) {
    case 1: // Session A: AI, ML & Intelligent Analytics
      return ["data_science"];
    case 2: // Session B: Educational, Healthcare & Human Development Systems
      return ["application_development"];
    case 3: // Session C: IoT, Smart Environment & Sustainability
      return ["computer_architecture_iot"];
    case 4: // Session D: Business, Community & Enterprise Information Systems
      return ["application_development", "data_science"];
    case 5: // Session E: Tourism, Hospitality, Recreation & Smart Service Applications
      return ["application_development"];
    case 6: // Session F: Systems Analysis & Design Showcase
      return ["system_analysis_design"];
    case 7: // Session G: HCI & Java Programming Peer Mentoring Session
      return ["hci"];
    default:
      return [];
  }
};

// Flat list of { value, label } award options available for a session,
// ready to drop into a <select>. value is a stable slug used for storage.
export const getAwardOptionsForSession = (sessionTypeId) => {
  const categoryKeys = getAwardCategoryKeysForSession(sessionTypeId);
  const options = [];
  categoryKeys.forEach((categoryKey) => {
    const category = AWARD_CATEGORIES[categoryKey];
    category.awards.forEach((awardLabel) => {
      options.push({
        value: `${categoryKey}:${awardLabel}`,
        label: awardLabel,
        categoryLabel: category.label,
      });
    });
  });
  return options;
};