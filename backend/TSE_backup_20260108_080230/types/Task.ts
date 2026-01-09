import { VALID_CATEGORIES } from '../constants/TaskCategories';

/**
 * Standardized Task shape produced by TeacherComponent and consumed by Student & Evaluator.
 * Enforces strict contract across the entire TSE loop.
 */
export interface Task {
  taskId: string;
  taskType: string;
  taskCategory: typeof VALID_CATEGORIES[number];
  knowledgeId?: string;
  input: {
    instructions: string;
    content?: string;
    expectedFormat?: string;
    tone?: string;
    maxLength?: number;
  };
  difficulty: number;
  characterId: string;
  metadata: Record<string, any>;
}

/**
 * Standardized attempt shape returned by StudentComponent.
 */
export interface Attempt {
  attemptId: string;
  taskId: string;
  characterId: string;
  knowledgeId?: string;
  attemptText: string;
  metadata: Record<string, any>;
}

/**
 * Standardized evaluation shape returned by EvaluatorComponent.
 */
export interface Evaluation {
  score: number;
  fsrsGrade?: number;
  feedback: string;
  processHint?: string;
  selfRegPrompt?: string;
  masteryDelta?: number;
}
