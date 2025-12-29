import { z } from 'zod';

export const StateDataSchemas = {
  new: z.object({}).strict(),
  
  welcomed: z.object({
    welcome_beat_id: z.string().optional()
  }).strict(),
  
  awaiting_ready: z.object({}).strict(),
  
  omiyage_offered: z.object({
    choice_id: z.string().startsWith('#').optional()
  }).strict(),
  
  onboarded: z.object({
    choice_id: z.string().startsWith('#').optional(),
    declined: z.boolean().optional(),
    deferred: z.boolean().optional(),
    admin_override: z.boolean().optional()
  }).strict()
};
