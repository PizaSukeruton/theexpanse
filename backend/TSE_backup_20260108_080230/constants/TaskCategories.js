/**
 * Authoritative list of allowed task categories in the TSE loop.
 * Every task.taskCategory MUST be exactly one of these values.
 * No dotted values (e.g. rewrite.summarize), no null, no empty string, no extras.
 */

// Single source of truth: the category values as a const object
export const TASK_CATEGORIES = {
  ACQUISITION: "acquisition",
  RECALL: "recall",
  COMMUNICATION_QUALITY: "communication_quality",
  REWRITE: "rewrite",
  REVIEW: "review",
  APPLICATION: "application",
};

// Derived array (for runtime use, if needed)
export const VALID_CATEGORIES = Object.values(TASK_CATEGORIES);

// Note: TaskCategory type cannot be exported in pure JS
// For TypeScript consumers, use: type TaskCategory = typeof TASK_CATEGORIES[keyof typeof TASK_CATEGORIES];
