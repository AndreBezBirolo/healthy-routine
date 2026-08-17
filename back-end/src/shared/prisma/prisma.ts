import { PrismaClient } from '@prisma/client';
import { getRequestContext } from '../context/request-context.js';
import { logger } from '../logger/logger.js';

const basePrisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

export const prisma = basePrisma.$extends({
  name: 'audit-extension',
  query: {
    mealPlan: {
      async update({ args, query }) {
        const ctx = getRequestContext();
        const previous = await basePrisma.mealPlan.findUnique({
          where: args.where,
        });

        const result = await query(args);

        if (ctx?.workspaceId && previous) {
          const changedFields: Record<string, { old: any; new: any }> = {};
          for (const key of Object.keys(args.data)) {
            const oldVal = (previous as any)[key];
            const newVal = (result as any)[key];
            if (oldVal !== newVal) {
              changedFields[key] = { old: oldVal, new: newVal };
            }
          }

          if (Object.keys(changedFields).length > 0) {
            await basePrisma.activityLog.create({
              data: {
                workspaceId: ctx.workspaceId,
                userId: ctx.userId ?? null,
                action: 'UPDATE',
                entity: 'MEAL_PLAN',
                entityId: (result as any).id || '',
                changes: JSON.stringify(changedFields),
              },
            }).catch((err) => {
              logger.error({ err }, 'Failed to record audit log on mealPlan.update');
            });
          }
        }

        return result;
      },
      async create({ args, query }) {
        const ctx = getRequestContext();
        const result = await query(args);

        const workspaceId = ctx?.workspaceId || (result as any).workspaceId;
        if (workspaceId) {
          await basePrisma.activityLog.create({
            data: {
              workspaceId,
              userId: ctx?.userId ?? null,
              action: 'CREATE',
              entity: 'MEAL_PLAN',
              entityId: (result as any).id || '',
              changes: JSON.stringify({
                recipeTitle: { old: null, new: (result as any).recipeTitle },
                mealType: { old: null, new: (result as any).mealType },
                isSpecial: { old: null, new: (result as any).isSpecial },
                isMealPrep: { old: null, new: (result as any).isMealPrep },
              }),
            },
          }).catch((err) => {
            logger.error({ err }, 'Failed to record audit log on mealPlan.create');
          });
        }

        return result;
      },
      async delete({ args, query }) {
        const ctx = getRequestContext();
        const previous = await basePrisma.mealPlan.findUnique({
          where: args.where,
        });

        const result = await query(args);

        const workspaceId = ctx?.workspaceId || previous?.workspaceId;
        if (workspaceId && previous) {
          await basePrisma.activityLog.create({
            data: {
              workspaceId,
              userId: ctx?.userId ?? null,
              action: 'DELETE',
              entity: 'MEAL_PLAN',
              entityId: previous.id,
              changes: JSON.stringify({
                recipeTitle: { old: previous.recipeTitle, new: null },
              }),
            },
          }).catch((err) => {
            logger.error({ err }, 'Failed to record audit log on mealPlan.delete');
          });
        }

        return result;
      },
    },
  },
});
