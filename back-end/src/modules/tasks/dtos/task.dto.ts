import { z } from 'zod';

export const taskCategoryEnum = z.enum(['HOUSEHOLD', 'CLEANING', 'HABIT', 'PET', 'MAINTENANCE']);
export const recurrenceEnum = z.enum(['NONE', 'DAILY', 'WEEKLY', 'MONTHLY']);

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  category: taskCategoryEnum.default('HOUSEHOLD'),
  dueDate: z.string().optional(), // YYYY-MM-DD
  recurrence: recurrenceEnum.default('NONE'),
  assignedToUserId: z.string().uuid().nullable().optional(),
  points: z.number().int().default(10),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  category: taskCategoryEnum.optional(),
  dueDate: z.string().nullable().optional(),
  recurrence: recurrenceEnum.optional(),
  completed: z.boolean().optional(),
  assignedToUserId: z.string().uuid().nullable().optional(),
  points: z.number().int().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
