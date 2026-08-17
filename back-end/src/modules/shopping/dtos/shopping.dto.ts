import { z } from 'zod';

export const shoppingCategoryEnum = z.enum([
  'GROCERIES',
  'PRODUCE',
  'SPICES',
  'HOUSEHOLD',
  'HYGIENE',
  'PET',
  'OTHER',
]);

export const recurrenceEnum = z.enum(['NONE', 'WEEKLY', 'MONTHLY']);

export const createShoppingItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  quantity: z.string().optional(),
  price: z.number().optional(),
  category: shoppingCategoryEnum.default('GROCERIES'),
  recurrence: recurrenceEnum.default('NONE'),
  notes: z.string().optional(),
});

export const updateShoppingItemSchema = z.object({
  name: z.string().min(1).optional(),
  quantity: z.string().nullable().optional(),
  price: z.number().nullable().optional(),
  category: shoppingCategoryEnum.optional(),
  recurrence: recurrenceEnum.optional(),
  notes: z.string().nullable().optional(),
  checked: z.boolean().optional(),
});

export type CreateShoppingItemInput = z.infer<typeof createShoppingItemSchema>;
export type UpdateShoppingItemInput = z.infer<typeof updateShoppingItemSchema>;

export const toggleShoppingItemSchema = z.object({
  checked: z.boolean(),
});
