import { z } from 'zod';

export const mealTypeEnum = z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']);

export const createMealPlanSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  mealType: mealTypeEnum.default('LUNCH'),
  isMealPrep: z.boolean().default(false),
  isSpecial: z.boolean().default(false),
  recipeTitle: z.string().min(1, 'Recipe title is required'),
  ingredients: z.array(z.string()).optional(),
  notes: z.string().optional(),
  assignedToUserId: z.string().uuid().nullable().optional(),
});

export const updateMealPlanSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  mealType: mealTypeEnum.optional(),
  isMealPrep: z.boolean().optional(),
  isSpecial: z.boolean().optional(),
  isConsumed: z.boolean().optional(),
  recipeTitle: z.string().min(1).optional(),
  ingredients: z.array(z.string()).optional(),
  notes: z.string().optional(),
  assignedToUserId: z.string().uuid().nullable().optional(),
});

export type CreateMealPlanInput = z.infer<typeof createMealPlanSchema>;
export type UpdateMealPlanInput = z.infer<typeof updateMealPlanSchema>;

export const batchMealPrepSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  startDay: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  daysCount: z.number().int().min(1).max(30).default(5),
  mealType: mealTypeEnum.optional().default('LUNCH'),
  mealTypes: z.array(mealTypeEnum).optional(),
  recipeTitle: z.string().min(1, 'Recipe title is required'),
  ingredients: z.array(z.string()).optional(),
  notes: z.string().optional(),
  assignedToUserId: z.string().uuid().nullable().optional(),
});

export type BatchMealPrepInput = z.infer<typeof batchMealPrepSchema>;
