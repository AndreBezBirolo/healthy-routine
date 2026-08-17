import { z } from 'zod';
export const recipeCategoryEnum = z.enum(['GOURMET', 'QUICK', 'WEEKEND', 'DESSERT', 'DRINK']);
export const ingredientItemSchema = z.object({
    name: z.string().min(1, 'Ingredient name is required'),
    quantity: z.string().optional(),
    unit: z.string().optional(),
});
export const createRecipeSchema = z.object({
    title: z.string().min(2, 'Recipe title must be at least 2 characters'),
    category: recipeCategoryEnum.default('QUICK'),
    ingredients: z.array(ingredientItemSchema),
    instructions: z.string().min(5, 'Instructions must be at least 5 characters'),
    prepTimeMinutes: z.number().int().min(1).default(30),
    isFavorite: z.boolean().default(false),
});
