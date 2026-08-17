import crypto from 'node:crypto';
import { prisma } from '../../../shared/prisma/prisma.js';
import { AppError } from '../../../shared/errors/app-error.js';
import { CreateWorkspaceInput, JoinWorkspaceInput } from '../dtos/workspace.dto.js';

export class WorkspaceUseCase {
  async createWorkspace(userId: string, data: CreateWorkspaceInput) {
    const inviteCode = crypto.randomBytes(3).toString('hex').toUpperCase(); // e.g. "A3B8F1"

    const workspace = await prisma.workspace.create({
      data: {
        name: data.name,
        inviteCode,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: 'OWNER',
          },
        },
        subscription: {
          create: {
            planType: 'FREE',
            status: 'ACTIVE',
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true },
            },
          },
        },
      },
    });

    return workspace;
  }

  async joinWorkspace(userId: string, data: JoinWorkspaceInput) {
    const workspace = await prisma.workspace.findUnique({
      where: { inviteCode: data.inviteCode },
    });

    if (!workspace) {
      throw new AppError('WORKSPACE_NOT_FOUND', 404);
    }

    const existingMember = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: workspace.id,
          userId,
        },
      },
    });

    if (existingMember) {
      throw new AppError('ALREADY_MEMBER', 409);
    }

    await prisma.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId,
        role: 'MEMBER',
      },
    });

    return workspace;
  }

  async getUserWorkspaces(userId: string) {
    const memberships = await prisma.workspaceMember.findMany({
      where: { userId },
      include: {
        workspace: {
          include: {
            members: {
              include: {
                user: {
                  select: { id: true, name: true, email: true, avatarUrl: true },
                },
              },
            },
          },
        },
      },
    });

    return memberships.map((m) => m.workspace);
  }
}
