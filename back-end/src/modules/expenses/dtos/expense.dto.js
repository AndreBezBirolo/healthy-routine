import { z } from 'zod';
export const expenseCategoryEnum = z.enum([
    'GROCERIES', // Compras de Mercado / Ingredientes
    'DATE_NIGHT', // Jantar Fora / Delivery Especial / Cinema
    'HOUSEHOLD', // Itens da Casa / Limpeza
    'OTHER',
]);
export const createExpenseSchema = z.object({
    title: z.string().min(2, 'Title must be at least 2 characters'),
    amount: z.number().positive('Amount must be greater than zero'),
    category: expenseCategoryEnum.default('GROCERIES'),
    paidByUserId: z.string().uuid().optional(),
    splitEqually: z.boolean().default(true),
    notes: z.string().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
});
