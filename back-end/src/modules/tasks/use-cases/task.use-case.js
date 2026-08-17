import { prisma } from '../../../shared/prisma/prisma.js';
import { AppError } from '../../../shared/errors/app-error.js';
export class TaskUseCase {
    async getTasks(workspaceId) {
        const tasks = await prisma.task.findMany({
            where: { workspaceId },
            include: {
                assignedTo: {
                    select: { id: true, name: true, avatarUrl: true },
                },
            },
            orderBy: [{ completed: 'asc' }, { createdAt: 'desc' }],
        });
        return tasks;
    }
    async createTask(workspaceId, data) {
        const dueDateParsed = data.dueDate ? new Date(`${data.dueDate}T12:00:00.000Z`) : null;
        const task = await prisma.task.create({
            data: {
                workspaceId,
                title: data.title,
                category: data.category,
                dueDate: dueDateParsed,
                recurrence: data.recurrence,
                assignedToUserId: data.assignedToUserId || null,
                points: data.points,
            },
            include: {
                assignedTo: {
                    select: { id: true, name: true, avatarUrl: true },
                },
            },
        });
        return task;
    }
    async updateTask(taskId, data) {
        const existing = await prisma.task.findUnique({ where: { id: taskId } });
        if (!existing) {
            throw new AppError('TASK_NOT_FOUND', 404);
        }
        const dueDateParsed = data.dueDate !== undefined
            ? (data.dueDate ? new Date(`${data.dueDate}T12:00:00.000Z`) : null)
            : undefined;
        const task = await prisma.task.update({
            where: { id: taskId },
            data: {
                title: data.title,
                category: data.category,
                dueDate: dueDateParsed,
                recurrence: data.recurrence,
                completed: data.completed,
                completedAt: data.completed !== undefined ? (data.completed ? new Date() : null) : undefined,
                assignedToUserId: data.assignedToUserId,
                points: data.points,
            },
            include: {
                assignedTo: {
                    select: { id: true, name: true, avatarUrl: true },
                },
            },
        });
        return task;
    }
    async toggleTaskCompleted(taskId, completed, userId) {
        const existing = await prisma.task.findUnique({ where: { id: taskId } });
        if (!existing) {
            throw new AppError('TASK_NOT_FOUND', 404);
        }
        let userObj = null;
        if (userId) {
            userObj = await prisma.user.findUnique({ where: { id: userId } });
        }
        const now = new Date();
        const task = await prisma.task.update({
            where: { id: taskId },
            data: {
                completed,
                completedAt: completed ? now : null,
                completedByUserId: completed ? userId : null,
                lastCompletedBy: completed && userObj ? userObj.name : existing.lastCompletedBy,
            },
            include: {
                assignedTo: {
                    select: { id: true, name: true, avatarUrl: true },
                },
            },
        });
        return task;
    }
    async deleteTask(taskId) {
        const existing = await prisma.task.findUnique({ where: { id: taskId } });
        if (!existing) {
            throw new AppError('TASK_NOT_FOUND', 404);
        }
        await prisma.task.delete({ where: { id: taskId } });
        return { success: true };
    }
}
