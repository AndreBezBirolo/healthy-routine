import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  name: z.string().min(2, 'Workspace name must be at least 2 characters'),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;

export const joinWorkspaceSchema = z.object({
  inviteCode: z.string().min(4, 'Invalid invite code'),
});

export type JoinWorkspaceInput = z.infer<typeof joinWorkspaceSchema>;
