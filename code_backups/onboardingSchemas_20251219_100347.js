import { z } from 'zod';

export const StateDataSchemas = {
  new: z.object({}).strict(),
  
  welcomed: z.object({
    welcome_beat_id: z.string().optional()
  }).strict(),
  
  awaiting_ready: z.object({
    ready_prompt_id: z.string().optional()
  }).strict(),
  
  omiyage_offered: z.object({
    choice_id: z.string().startsWith('#')
  }).strict(),
  
  onboarded: z.object({
    completed_at: z.string().optional()
  }).strict()
};
