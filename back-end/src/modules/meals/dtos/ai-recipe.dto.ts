import { z } from 'zod';

export const suggestAiRecipeSchema = z.object({
  ingredientsAvailable: z.array(z.string()).min(1, 'At least one ingredient must be provided'),
  dietPreference: z.enum(['HEALTHY', 'COMFORT_FOOD', 'ROMANTIC_DATE', 'QUICK_MEAL']).default('ROMANTIC_DATE'),
});

export type SuggestAiRecipeInput = z.infer<typeof suggestAiRecipeSchema>;
