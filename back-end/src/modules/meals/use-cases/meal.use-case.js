import { prisma } from '../../../shared/prisma/prisma.js';
import { AppError } from '../../../shared/errors/app-error.js';
export class MealUseCase {
    async getTodayMeals(workspaceId, dateIso) {
        const targetDate = new Date(`${dateIso}T00:00:00.000Z`);
        const nextDate = new Date(targetDate.getTime() + 24 * 60 * 60 * 1000);
        const meals = await prisma.mealPlan.findMany({
            where: {
                workspaceId,
                date: {
                    gte: targetDate,
                    lt: nextDate,
                },
            },
            include: {
                assignedTo: {
                    select: { id: true, name: true, avatarUrl: true },
                },
            },
            orderBy: { mealType: 'asc' },
        });
        return meals.map((m) => ({
            ...m,
            ingredients: m.ingredients ? JSON.parse(m.ingredients) : [],
        }));
    }
    async getWeekMeals(workspaceId, startDateIso) {
        const startDate = new Date(`${startDateIso}T00:00:00.000Z`);
        const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        const meals = await prisma.mealPlan.findMany({
            where: {
                workspaceId,
                date: {
                    gte: startDate,
                    lt: endDate,
                },
            },
            include: {
                assignedTo: {
                    select: { id: true, name: true, avatarUrl: true },
                },
            },
            orderBy: [{ date: 'asc' }, { mealType: 'asc' }],
        });
        return meals.map((m) => ({
            ...m,
            ingredients: m.ingredients ? JSON.parse(m.ingredients) : [],
        }));
    }
    async createMeal(workspaceId, data) {
        const mealDate = new Date(`${data.date}T00:00:00.000Z`);
        const meal = await prisma.mealPlan.create({
            data: {
                workspaceId,
                date: mealDate,
                mealType: data.mealType,
                isMealPrep: data.isMealPrep,
                isSpecial: data.isSpecial,
                recipeTitle: data.recipeTitle,
                ingredients: data.ingredients ? JSON.stringify(data.ingredients) : null,
                notes: data.notes,
                assignedToUserId: data.assignedToUserId,
            },
            include: {
                assignedTo: {
                    select: { id: true, name: true, avatarUrl: true },
                },
            },
        });
        return {
            ...meal,
            ingredients: meal.ingredients ? JSON.parse(meal.ingredients) : [],
        };
    }
    async updateMeal(mealId, data) {
        const existing = await prisma.mealPlan.findUnique({ where: { id: mealId } });
        if (!existing) {
            throw new AppError('MEAL_NOT_FOUND', 404);
        }
        const mealDate = data.date ? new Date(`${data.date}T00:00:00.000Z`) : undefined;
        const meal = await prisma.mealPlan.update({
            where: { id: mealId },
            data: {
                date: mealDate,
                mealType: data.mealType,
                isMealPrep: data.isMealPrep,
                isSpecial: data.isSpecial,
                isConsumed: data.isConsumed,
                consumedAt: data.isConsumed !== undefined ? (data.isConsumed ? new Date() : null) : undefined,
                recipeTitle: data.recipeTitle,
                ingredients: data.ingredients !== undefined ? JSON.stringify(data.ingredients) : undefined,
                notes: data.notes,
                assignedToUserId: data.assignedToUserId,
            },
            include: {
                assignedTo: {
                    select: { id: true, name: true, avatarUrl: true },
                },
            },
        });
        return {
            ...meal,
            ingredients: meal.ingredients ? JSON.parse(meal.ingredients) : [],
        };
    }
    async toggleConsumed(mealId, isConsumed) {
        const existing = await prisma.mealPlan.findUnique({ where: { id: mealId } });
        if (!existing) {
            throw new AppError('MEAL_NOT_FOUND', 404);
        }
        const meal = await prisma.mealPlan.update({
            where: { id: mealId },
            data: {
                isConsumed,
                consumedAt: isConsumed ? new Date() : null,
            },
            include: {
                assignedTo: {
                    select: { id: true, name: true, avatarUrl: true },
                },
            },
        });
        return {
            ...meal,
            ingredients: meal.ingredients ? JSON.parse(meal.ingredients) : [],
        };
    }
    async deleteMeal(mealId) {
        const existing = await prisma.mealPlan.findUnique({ where: { id: mealId } });
        if (!existing) {
            throw new AppError('MEAL_NOT_FOUND', 404);
        }
        await prisma.mealPlan.delete({ where: { id: mealId } });
        return { success: true };
    }
    async batchCreateMealPrep(workspaceId, data) {
        const rawDate = data.startDate || data.startDay || new Date().toISOString().split('T')[0];
        const startDate = new Date(`${rawDate}T00:00:00.000Z`);
        const createdMeals = [];
        const typesToCreate = data.mealTypes && data.mealTypes.length > 0 ? data.mealTypes : [data.mealType || 'LUNCH'];
        for (let i = 0; i < data.daysCount; i++) {
            const currentDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
            for (const mType of typesToCreate) {
                const meal = await prisma.mealPlan.create({
                    data: {
                        workspaceId,
                        date: currentDate,
                        mealType: mType,
                        isMealPrep: true,
                        isSpecial: false,
                        recipeTitle: data.recipeTitle,
                        ingredients: data.ingredients ? JSON.stringify(data.ingredients) : null,
                        notes: data.notes,
                        assignedToUserId: data.assignedToUserId || null,
                    },
                    include: {
                        assignedTo: {
                            select: { id: true, name: true, avatarUrl: true },
                        },
                    },
                });
                createdMeals.push({
                    ...meal,
                    ingredients: meal.ingredients ? JSON.parse(meal.ingredients) : [],
                });
            }
        }
        return createdMeals;
    }
}
