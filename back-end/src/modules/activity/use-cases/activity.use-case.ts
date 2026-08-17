import { prisma } from '../../../shared/prisma/prisma.js';

export class ActivityUseCase {
  async getActivityFeed(workspaceId: string, limit = 20, cursor?: string) {
    const logs = await prisma.activityLog.findMany({
      where: { workspaceId },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    return {
      items: logs.map((log) => ({
        id: log.id,
        action: log.action,
        entity: log.entity,
        entityId: log.entityId,
        changes: JSON.parse(log.changes || '{}'),
        performedBy: log.user ? { id: log.user.id, name: log.user.name } : null,
        createdAt: log.createdAt,
      })),
      nextCursor: logs.length === limit ? logs[logs.length - 1].id : null,
    };
  }
}
