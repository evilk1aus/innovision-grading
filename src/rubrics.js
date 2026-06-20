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
